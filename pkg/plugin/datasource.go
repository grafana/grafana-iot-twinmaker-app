package plugin

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/aws/smithy-go"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/plugin/twinmaker"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// NewTwinMakerInstance creates a new datasource instance.
func NewTwinMakerInstance(ctx context.Context, s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings := models.TwinMakerDataSourceSetting{}
	err := settings.Load(s)
	if err != nil {
		return nil, err
	}
	err = settings.Validate()
	if err != nil {
		return nil, err
	}
	proxyOptions, err := s.ProxyOptionsFromContext(ctx)
	if err != nil {
		return nil, err
	}
	settings.ProxyOptions = proxyOptions

	return NewTwinMakerDatasource(ctx, settings), nil
}

type TwinMakerDatasource struct {
	settings models.TwinMakerDataSourceSetting
	router   *mux.Router
	client   twinmaker.TwinMakerClient // only used for healthcheck
	handler  twinmaker.TwinMakerHandler
	res      twinmaker.TwinMakerResources
	streamMu sync.RWMutex
	streams  map[string]models.TwinMakerQuery
}

// Make sure TwinMakerDatasource implements required interfaces.
// This is important to do since otherwise we will only get a
// not implemented error response from plugin in runtime.
var (
	_ backend.QueryDataHandler      = (*TwinMakerDatasource)(nil)
	_ backend.CheckHealthHandler    = (*TwinMakerDatasource)(nil)
	_ backend.StreamHandler         = (*TwinMakerDatasource)(nil)
	_ backend.CallResourceHandler   = (*TwinMakerDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*TwinMakerDatasource)(nil)
)

// NewTwinMakerDatasource creates a new datasource instance.
func NewTwinMakerDatasource(ctx context.Context, settings models.TwinMakerDataSourceSetting) *TwinMakerDatasource {
	c, err := twinmaker.NewTwinMakerClient(ctx, settings)
	if err != nil {
		backend.Logger.Error("Error initializing TwinMakerTokenProvider", "err", err)
		return nil
	}

	// Caching the frame results -- not twinmaker raw results
	// cached := twinmaker.NewCachingClient(c, 30*time.Minute)

	return newTwinMakerDatasource(settings, c)
}

func newTwinMakerDatasource(settings models.TwinMakerDataSourceSetting, c twinmaker.TwinMakerClient) *TwinMakerDatasource {
	ttl := 30 * time.Minute
	cachingClient := twinmaker.NewCachingClient(c, ttl)

	r := mux.NewRouter()
	ds := &TwinMakerDatasource{
		settings: settings,
		client:   c,
		router:   r,
		handler:  twinmaker.NewTwinMakerHandler(cachingClient),
		streams:  make(map[string]models.TwinMakerQuery),

		// Since the whole result is cached, this does not use the cached client
		res: twinmaker.NewCachingResource(
			twinmaker.NewTwinMakerResource(c, settings.WorkspaceID),
			ttl),
	}
	r.HandleFunc("/token", ds.HandleGetToken)
	r.HandleFunc("/entity-properties", ds.HandleBatchPutPropertyValues)

	// they are now cached depending on the res set in the ds above
	r.HandleFunc("/entity", ds.HandleGetEntity)
	r.HandleFunc("/list/workspaces", ds.HandleListWorkspaces)
	r.HandleFunc("/list/scenes", ds.HandleListScenes)
	r.HandleFunc("/list/options", ds.HandleListOptions)
	r.HandleFunc("/list/entity", ds.HandleListEntityOptions)
	return ds
}

// Dispose here tells plugin SDK that plugin wants to clean up resources
// when a new instance created. As soon as datasource settings change detected
// by SDK old datasource instance will be disposed and a new one will be created
// using NewTwinMakerDatasource factory function.
func (ds *TwinMakerDatasource) Dispose() {
	// Nothing to clean up yet.
	backend.Logger.Info("Called when the settings change", "cfg", ds.settings)
}

func (ds *TwinMakerDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		query, err := models.ReadQuery(q)
		if err != nil {
			response.Responses[q.RefID] = backend.DataResponse{
				Error: err,
			}
			continue
		}

		res := ds.DoQuery(ctx, query)
		if res.Error != nil {
			response.Responses[q.RefID] = res
			continue
		}

		// if the results are paged, save the next token in the query
		// so that RunStream can start from the next page
		if customMeta := models.LoadMetaFromResponse(res); customMeta != nil {
			query.NextToken = customMeta.NextToken
		}

		// we don't need to continue if Live is disabled, the query is not streaming updates,
		// or if the result is empty.
		if !query.GrafanaLiveEnabled || (query.NextToken == "" && !query.IsStreaming) || len(res.Frames) == 0 {
			response.Responses[q.RefID] = res
			continue
		}

		// set the streaming channel topic on the first frame in the response
		queryUID := uuid.New().String()
		if res.Frames[0].Meta == nil {
			res.Frames[0].Meta = &data.FrameMeta{}
		}
		res.Frames[0].Meta.Channel = fmt.Sprintf("ds/%s/%s", ds.settings.UID, queryUID)
		response.Responses[q.RefID] = res

		// set the new time range for the first streaming request
		if query.NextToken == "" {
			if ts := getFromTimestamp(res); ts != nil {
				query.TimeRange.From = *ts
			}
			query.TimeRange.To = time.Now().Add(query.IntervalStreaming)
		}

		// stash the query in the stream map for use in RunStream
		ds.streamMu.Lock()
		ds.streams[queryUID] = query
		ds.streamMu.Unlock()
	}

	return response, nil
}

func (ds *TwinMakerDatasource) CheckHealth(ctx context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	if ds.settings.WorkspaceID == "" {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "Missing WorkspaceID configuration",
		}, nil
	}
	// TODO: add in changelog
	if ds.settings.AssumeRoleARN == "" {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "Assume Role ARN is required",
		}, nil
	}

	_, err := ds.handler.GetSessionToken(ctx, time.Second*3600, ds.settings.WorkspaceID)
	if err != nil {
		var smErr *smithy.OperationError
		if errors.As(err, &smErr) {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: smErr.Error(),
			}, nil
		}
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "Failed to get session token",
		}, nil
	}

	res, err := ds.client.GetWorkspace(ctx, models.TwinMakerQuery{
		WorkspaceId: ds.settings.WorkspaceID,
	})
	if err != nil {
		var smErr *smithy.OperationError
		if errors.As(err, &smErr) {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: smErr.Error(),
			}, nil
		}
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "Failed to get workspace ID",
		}, nil
	}

	workspace := ""
	if res.Description != nil && *res.Description != "" {
		workspace = *res.Description
	} else {
		workspace = *res.WorkspaceId
	}

	if ds.settings.AssumeRoleARNWriter != "" {
		_, err := ds.handler.GetWriteSessionToken(ctx, time.Second*3600, ds.settings.WorkspaceID)
		if err != nil {
			var smErr smithy.APIError
			if errors.As(err, &smErr) {
				return &backend.CheckHealthResult{
					Status:  backend.HealthStatusError,
					Message: err.Error(),
				}, nil
			}
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: "Failed to get session token",
			}, nil
		}
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: fmt.Sprintf("TwinMaker datasource successfully configured (%s)", workspace),
	}, nil
}

func (ds *TwinMakerDatasource) SubscribeStream(_ context.Context, req *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	status := backend.SubscribeStreamStatusNotFound

	ds.streamMu.RLock()
	if _, ok := ds.streams[req.Path]; ok {
		status = backend.SubscribeStreamStatusOK
	}
	ds.streamMu.RUnlock()

	return &backend.SubscribeStreamResponse{
		Status: status,
	}, nil
}

func (ds *TwinMakerDatasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	ds.streamMu.Lock()
	query, ok := ds.streams[req.Path]
	if !ok {
		ds.streamMu.Unlock()
		return fmt.Errorf("not found")
	}
	delete(ds.streams, req.Path)
	ds.streamMu.Unlock()

	resChannel := make(chan *backend.DataResponse)
	go ds.RequestLoop(ctx, query, resChannel)

	for {
		select {
		case <-ctx.Done():
			return nil
		case res := <-resChannel:
			if res == nil {
				return nil
			}
			if res.Error != nil {
				return res.Error
			}
			for _, frame := range res.Frames {
				if err := sender.SendFrame(frame, data.IncludeAll); err != nil {
					return err
				}
			}
		}
	}
}

func (ds *TwinMakerDatasource) PublishStream(_ context.Context, _ *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}

func (ds *TwinMakerDatasource) DoQuery(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// set the default datasource WorkspaceId if missing in the query
	if query.WorkspaceId == "" {
		query.WorkspaceId = ds.settings.WorkspaceID
	}

	switch query.QueryType {
	case models.QueryTypeListWorkspace:
		return ds.handler.ListWorkspaces(ctx, query)
	case models.QueryTypeListScenes:
		return ds.handler.ListScenes(ctx, query)
	case models.QueryTypeListEntities:
		return ds.handler.ListEntities(ctx, query)
	case models.QueryTypeGetEntity:
		return ds.handler.GetEntity(ctx, query)
	case models.QueryTypeGetPropertyValue:
		return ds.handler.GetPropertyValue(ctx, query)
	case models.QueryTypeEntityHistory:
		return ds.handler.GetEntityHistory(ctx, query)
	case models.QueryTypeComponentHistory:
		return ds.handler.GetComponentHistory(ctx, query)
	case models.QueryTypeGetAlarms:
		return ds.handler.GetAlarms(ctx, query)
	}

	return response
}

func (ds *TwinMakerDatasource) RequestLoop(ctx context.Context, query models.TwinMakerQuery, resChannel chan *backend.DataResponse) {
	// stop the request loop if the context is cancelled
	select {
	case <-ctx.Done():
		resChannel <- nil
		return
	default:
	}

	res := ds.DoQuery(ctx, query)
	resChannel <- &res
	if res.Error != nil {
		resChannel <- nil
		return
	}

	customMeta := models.LoadMetaFromResponse(res)
	// if the results are paged, request the next page
	if customMeta != nil {
		query.NextToken = customMeta.NextToken
		ds.RequestLoop(ctx, query, resChannel)
		return
	}

	// we've hit the last page, and this isn't a streaming response,
	// so we can close the channel and return
	if !query.IsStreaming {
		resChannel <- nil
		return
	}

	// reset the next token for the streaming query
	query.NextToken = ""

	if ts := getFromTimestamp(res); ts != nil {
		query.TimeRange.From = *ts
	}

	time.Sleep(query.IntervalStreaming)
	query.TimeRange.To = time.Now()
	ds.RequestLoop(ctx, query, resChannel)
}

func (d *TwinMakerDatasource) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	d.router.ServeHTTP(w, r)
}

// CallResource HTTP style resource
func (ds *TwinMakerDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	return httpadapter.New(ds).CallResource(ctx, req, sender)
}

func getFromTimestamp(res backend.DataResponse) *time.Time {
	var lastTimestamp *time.Time

	for _, frame := range res.Frames {
		for _, field := range frame.Fields {
			if field.Len() == 0 {
				continue
			}

			ts := time.Unix(0, 0)
			switch field.Type() {
			case data.FieldTypeTime:
				if t, ok := field.At(field.Len() - 1).(time.Time); ok {
					ts = t
				}
			case data.FieldTypeNullableTime:
				if t, ok := field.At(field.Len() - 1).(*time.Time); ok && t != nil {
					ts = *t
				}
			}

			if lastTimestamp == nil || ts.After(*lastTimestamp) {
				lastTimestamp = &ts
			}
		}
	}

	return lastTimestamp
}
