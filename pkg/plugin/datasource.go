package plugin

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/gorilla/mux"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/plugin/twinmaker"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

// NewTwinMakerInstance creates a new datasource instance.
func NewTwinMakerInstance(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings := models.TwinMakerDataSourceSetting{}
	err := settings.Load(s)
	if err != nil {
		return nil, err
	}
	err = settings.Validate()
	if err != nil {
		return nil, err
	}

	return NewTwinMakerDatasource(settings), nil
}

type TwinMakerDatasource struct {
	settings models.TwinMakerDataSourceSetting
	router   *mux.Router
	client   twinmaker.TwinMakerClient // only used for healthcheck
	handler  twinmaker.TwinMakerHandler
	res      twinmaker.TwinMakerResources
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
func NewTwinMakerDatasource(settings models.TwinMakerDataSourceSetting) *TwinMakerDatasource {
	c, err := twinmaker.NewTwinMakerClient(settings)
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

		// Since the whole result is cached, this does not use the cached client
		res: twinmaker.NewCachingResource(
			twinmaker.NewTwinMakerResource(c, settings.WorkspaceID),
			ttl),
	}
	r.HandleFunc("/token", ds.HandleGetToken)

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
		} else {
			response.Responses[q.RefID] = ds.DoQuery(ctx, query)
		}
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
		awsErr, ok := err.(awserr.Error)
		if ok {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: awsErr.Error(),
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
		awsErr, ok := err.(awserr.Error)
		if ok {
			return &backend.CheckHealthResult{
				Status:  backend.HealthStatusError,
				Message: awsErr.Message(),
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

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: fmt.Sprintf("TwinMaker datasource successfully configured (%s)", workspace),
	}, nil
}

func (ds *TwinMakerDatasource) SubscribeStream(ctx context.Context, req *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	type rawQuery struct {
		TimeRange struct {
			From int64 `json:"from"`
			To int64 `json:"to"`
		} `json:"timeRange"`
	}
	model := rawQuery{}
	if err := json.Unmarshal(req.Data, &model); err != nil {
		return nil, fmt.Errorf("could not read query: %w", err)
	}
	model2 := backend.DataQuery{
		JSON: req.Data,
	}
	q, err := models.ReadQuery(model2)
	if err != nil {
		return nil, fmt.Errorf("could not read query: %w", err)
	}
	q.TimeRange = backend.TimeRange{
		To: time.UnixMilli(model.TimeRange.To),
		From: time.UnixMilli(model.TimeRange.From),
	}
	if q.WorkspaceId == "" {
		q.WorkspaceId = ds.settings.WorkspaceID
	}
	res := ds.handler.GetEntityHistory(ctx, q)
	if res.Error != nil {
		return nil, res.Error
	}
	var initialData *backend.InitialData
	if len(res.Frames) > 1 {
		return nil, fmt.Errorf("multi frames are currently not supported")
	}
	if len(res.Frames) == 1 {
		b, err := data.FrameToJSON(res.Frames[0], data.IncludeAll)
		initialData, err = backend.NewInitialData(b)
		log.DefaultLogger.Info("SubscribeStream called", "request", req, "model2", err)
	}
	status := backend.SubscribeStreamStatusOK

	return &backend.SubscribeStreamResponse{
		Status: status,
		InitialData: initialData,
	}, nil
}

func (ds *TwinMakerDatasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	log.DefaultLogger.Info("RunStream called", "request data", req.Data)

	// Create the same data frame as for query data.
	frame := data.NewFrame("response")

	// Add fields (matching the same schema used in QueryData).
	frame.Fields = append(frame.Fields,
		data.NewField("values", nil, make([]float64, 1)),
		data.NewField("time", nil, make([]time.Time, 1)),
	)

	counter := 0

	// Stream data frames periodically till stream closed by Grafana.
	for {
		select {
		case <-ctx.Done():
			log.DefaultLogger.Info("Context done, finish streaming", "path", req.Path)
			return nil
		case <-time.After(time.Second):
			// parse path?
			// Send random data periodically.
			frame.Fields[0].Set(0, float64(10*(counter%2+1)))
			frame.Fields[1].Set(0, time.Now())

			counter++

			err := sender.SendFrame(frame, data.IncludeAll)
			if err != nil {
				log.DefaultLogger.Error("Error sending frame", "error", err)
				continue
			}
		}
	}
}
// PublishStream is called when a client sends a message to the stream.
func (d *TwinMakerDatasource) PublishStream(_ context.Context, req *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	log.DefaultLogger.Info("PublishStream called", "request", req)

	// Do not allow publishing at all.
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
		res := ds.handler.GetEntityHistory(ctx, query)
		frame := data.NewFrame("response")

		// Add fields (matching the same schema used in QueryData).
		frame.Fields = append(frame.Fields,
			data.NewField("values", nil, make([]float64, 1)),
			data.NewField("time", nil, make([]time.Time, 1)),
		)
		res.Frames = append(res.Frames, frame)
		res.Error = nil
		for i,_ := range res.Frames {
			res.Frames[i].SetMeta(&data.FrameMeta{
				Channel: fmt.Sprintf("ds/%s/30s/%s/%s", ds.settings.UID, query.EntityId, query.ComponentName),
			})
		}
		// TODO: 1. encode the properties inside the path of stream
		// path has to be unique per query (take a hash of the query, use as the key)
		backend.Logger.Info("debugging entity history", "meta", res.Frames[0].Meta)
		return res
	case models.QueryTypeComponentHistory:
		return ds.handler.GetComponentHistory(ctx, query)
	case models.QueryTypeGetAlarms:
		return ds.handler.GetAlarms(ctx, query)
	}

	return response
}

func (d *TwinMakerDatasource) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	d.router.ServeHTTP(w, r)
}

// CallResource HTTP style resource
func (ds *TwinMakerDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	return httpadapter.New(ds).CallResource(ctx, req, sender)
}
