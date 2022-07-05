package twinmaker

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/service/iottwinmaker"
	"github.com/aws/aws-sdk-go/service/sts"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// TwinMakerHandler uses a client to create grafana response objects
type TwinMakerHandler interface {
	GetSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (models.TokenInfo, error)
	ListWorkspaces(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	ListScenes(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	ListEntities(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	ListComponentTypes(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	GetEntity(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	GetPropertyValue(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse

	// These APIs do not exist in TwinMaker, but are simple constructions
	GetComponentHistory(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	GetEntityHistory(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
	GetAlarms(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse
}

type twinMakerHandler struct {
	client TwinMakerClient
}

func NewTwinMakerHandler(client TwinMakerClient) TwinMakerHandler {
	return &twinMakerHandler{
		client: client,
	}
}

func (s *twinMakerHandler) ListWorkspaces(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	results, err := s.client.ListWorkspaces(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	if results == nil {
		dr.Error = fmt.Errorf("error loading workspaces")
		return
	}

	fields := newTwinMakerFrameBuilder(len(results.WorkspaceSummaries))

	arn := fields.ARN()
	created := fields.CreationDate()
	description := fields.Description()
	workspaceId := fields.WorkspaceID()

	for i, summary := range results.WorkspaceSummaries {
		arn.Set(i, summary.Arn)
		created.Set(i, *summary.CreationDateTime)
		description.Set(i, summary.Description)
		workspaceId.Set(i, summary.WorkspaceId)
	}

	frame := fields.ToFrame("", results.NextToken)
	dr.Frames = data.Frames{frame}
	return
}

func (s *twinMakerHandler) ListScenes(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	results, err := s.client.ListScenes(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	if results == nil {
		dr.Error = fmt.Errorf("error loading scenes")
		return
	}

	fields := newTwinMakerFrameBuilder(len(results.SceneSummaries))

	arn := fields.ARN()
	created := fields.CreationDate()
	description := fields.Description()
	sceneId := fields.SceneId()

	for i, summary := range results.SceneSummaries {
		arn.Set(i, summary.Arn)
		created.Set(i, *summary.CreationDateTime)
		description.Set(i, summary.Description)
		sceneId.Set(i, summary.SceneId)
	}

	frame := fields.ToFrame("", results.NextToken)
	dr.Frames = data.Frames{frame}
	return
}

func (s *twinMakerHandler) ListEntities(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	results, err := s.client.ListEntities(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	if results == nil {
		dr.Error = fmt.Errorf("error loading entities")
		return
	}

	fields := newTwinMakerFrameBuilder(len(results.EntitySummaries))

	entityId := fields.EntityID()
	entityName := fields.Name()
	description := fields.Description()
	created := fields.CreationDate()
	arn := fields.ARN()

	for i, summary := range results.EntitySummaries {
		arn.Set(i, summary.Arn)
		created.Set(i, *summary.CreationDateTime)
		entityId.Set(i, summary.EntityId)
		entityName.Set(i, summary.EntityName)
		description.Set(i, summary.Description)
	}

	frame := fields.ToFrame("", results.NextToken)
	dr.Frames = data.Frames{frame}
	return
}

func (s *twinMakerHandler) ListComponentTypes(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	results, err := s.client.ListComponentTypes(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	if results == nil {
		dr.Error = fmt.Errorf("error loading componentTypes")
		return
	}

	fields := newTwinMakerFrameBuilder(len(results.ComponentTypeSummaries))

	componentId := fields.ComponentID()
	description := fields.Description()
	created := fields.CreationDate()
	arn := fields.ARN()

	for i, summary := range results.ComponentTypeSummaries {
		arn.Set(i, summary.Arn)
		created.Set(i, *summary.CreationDateTime)
		componentId.Set(i, summary.ComponentTypeId)
		description.Set(i, summary.Description)
	}

	frame := fields.ToFrame("", results.NextToken)
	dr.Frames = data.Frames{frame}
	return
}

func (s *twinMakerHandler) GetEntity(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	result, err := s.client.GetEntity(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	if result == nil {
		dr.Error = fmt.Errorf("error loading entity")
		return
	}

	// New row for each property in each component
	components := make([]string, 0, len(result.Components))
	for k := range result.Components {
		components = append(components, k)
	}

	fields := newTwinMakerFrameBuilder(len(components))

	componentField := fields.Component()
	componentTypeId := fields.ComponentTypeId()
	description := fields.Description()
	propertyField := fields.PropertiesInfo()
	timeSeriesField := fields.PropertiesInfo()
	timeSeriesField.Name = "timeSeries"

	sort.Strings(components)
	for i, c := range components {
		component := result.Components[c]

		properties := make([]string, 0, len(component.Properties))
		timeSeries := make([]string, 0, len(component.Properties))
		for k, v := range component.Properties {
			if v.Definition.DataType != nil && *v.Definition.IsTimeSeries {
				timeSeries = append(timeSeries, k)
			} else {
				properties = append(properties, k)
			}
		}
		sort.Strings(properties)
		sort.Strings(timeSeries)
		pInfo, _ := json.Marshal(properties)
		tInfo, _ := json.Marshal(timeSeries)

		if component.ComponentName != nil {
			componentField.Set(i, *component.ComponentName)
		}
		if component.ComponentTypeId != nil {
			componentTypeId.Set(i, *component.ComponentTypeId)
		}
		description.Set(i, component.Description)
		propertyField.Set(i, string(pInfo))
		timeSeriesField.Set(i, string(tInfo))
	}
	frame := fields.ToFrame("", nil)
	if result.EntityName != nil {
		frame.Name = *result.EntityName
	}

	dr.Frames = append(dr.Frames, frame)
	return
}

func (s *twinMakerHandler) GetPropertyValue(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	results, err := s.client.GetPropertyValue(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	if results == nil {
		dr.Error = fmt.Errorf("error loading propertyValue")
		return
	}

	frame := data.NewFrame("")
	propVals := make([]string, 0, len(results.PropertyValues))
	for k := range results.PropertyValues {
		propVals = append(propVals, k)
	}
	sort.Strings(propVals)

	for _, propVal := range propVals {
		prop := results.PropertyValues[propVal]
		if v := prop.PropertyValue.ListValue; v != nil {
			fr := s.processListValue(v, propVal)
			frame.Fields = append(frame.Fields, fr.Fields...)
			continue
		}
		if v := prop.PropertyValue.MapValue; v != nil {
			fr := s.processMapValue(v)
			frame.Fields = append(frame.Fields, fr.Fields...)
			continue
		}
		f, converter := newDataValueField(prop.PropertyValue, 1)
		f.Set(0, converter(prop.PropertyValue))

		f.Name = *prop.PropertyReference.PropertyName
		f.Labels = data.Labels{
			"entityId":      *prop.PropertyReference.EntityId,
			"componentName": *prop.PropertyReference.ComponentName,
		}
		frame.Fields = append(frame.Fields, f)
	}
	dr.Frames = append(dr.Frames, frame)

	return
}

func (s *twinMakerHandler) processListValue(v []*iottwinmaker.DataValue, propVal string) *data.Frame {
	fields := newTwinMakerFrameBuilder(len(v))

	valField, valConvertor := fields.Value(v[0])
	valField.Name = propVal

	isUrl := false
	for i, value := range v {
		valField.Set(i, valConvertor(value))
		if !isUrl {
			isUrl = checkForUrl(value, valConvertor)
		}
	}

	if isUrl {
		setUrlDatalink(valField)
	}

	frame := fields.ToFrame("", nil)
	return frame
}

func (s *twinMakerHandler) processMapValue(v map[string]*iottwinmaker.DataValue) *data.Frame {
	keys := make([]string, 0, len(v))
	for k := range v {
		keys = append(keys, k)
	}

	fields := newTwinMakerFrameBuilder(len(v))

	keyField := fields.Name()
	keyField.Name = "Key"
	valField, valConvertor := fields.Value(v[keys[0]])
	valField.Name = "Value"

	isUrl := false
	sort.Strings(keys)
	for i, k := range keys {
		keyField.Set(i, &keys[i])
		valField.Set(i, valConvertor(v[k]))
		if !isUrl {
			isUrl = checkForUrl(v[k], valConvertor)
		}
	}

	if isUrl {
		setUrlDatalink(valField)
	}

	frame := fields.ToFrame("", nil)
	return frame
}

func (s *twinMakerHandler) processHistory(results *iottwinmaker.GetPropertyValueHistoryOutput, err error, failures []data.Notice, query models.TwinMakerQuery) (dr backend.DataResponse) {
	dr.Error = err
	if err != nil {
		return
	}

	if results == nil {
		dr.Error = fmt.Errorf("error loading propertyValueHistory")
		return
	}

	for _, prop := range results.PropertyValues {
		if len(prop.Values) == 0 {
			continue
		}
		fields := newTwinMakerFrameBuilder(len(prop.Values))
		// Must return value field first so its labels can be used for the Time field
		v, conv := fields.Value(prop.Values[0].Value)
		t := fields.Time()
		v.Name = "" // filled in with value below
		for i, history := range prop.Values {
			if timeValue, err := getTimeObjectFromStringTime(history.Time); err == nil {
				t.Set(i, timeValue)
				v.Set(i, conv(history.Value))
			} else {
				dr.Error = fmt.Errorf("error parsing timestamp while loading propertyValueHistory")
			}
		}

		ref := prop.EntityPropertyReference
		v.Labels = data.Labels{}
		if ref.ComponentName != nil {
			v.Labels["componentName"] = *ref.ComponentName
		}
		if ref.EntityId != nil {
			v.Labels["entityId"] = *ref.EntityId
		}
		if ref.PropertyName != nil {
			v.Name = *ref.PropertyName
		}
		if ref.ComponentName == nil || ref.EntityId == nil {
			v.Labels["componentTypeId"] = query.ComponentTypeId
			for key, val := range ref.ExternalIdProperty {
				if key == "propertyName" {
					continue
				}
				v.Labels[key] = *val
			}
		}

		frame := fields.ToFrame("", results.NextToken)
		frame.AppendNotices(failures...)
		dr.Frames = append(dr.Frames, frame)
	}
	return
}

func (s *twinMakerHandler) GetComponentHistory(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	if query.ComponentTypeId == "" {
		return backend.DataResponse{
			Error: fmt.Errorf("missing component parameter"),
		}
	}

	propertyReferences, failures, err := s.GetComponentHistoryWithLookup(ctx, query)
	result := &iottwinmaker.GetPropertyValueHistoryOutput{
		NextToken:      nil,
		PropertyValues: []*iottwinmaker.PropertyValueHistory{},
	}

	for _, p := range propertyReferences {
		propertyValue := iottwinmaker.PropertyValueHistory{
			EntityPropertyReference: p.entityPropertyReference,
			Values:                  p.values,
		}
		result.PropertyValues = append(result.PropertyValues, &propertyValue)
	}

	// Return dataFrame with the history results and entityId and componentName
	return s.processHistory(result, err, failures, query)
}

func (s *twinMakerHandler) GetEntityHistory(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse {
	if query.EntityId == "" {
		return backend.DataResponse{
			Error: fmt.Errorf("missing entity parameter"),
		}
	}
	result, err := s.client.GetPropertyValueHistory(ctx, query)
	failures := []data.Notice{}
	return s.processHistory(result, err, failures, query)
}

// Variation of GetComponentHistory for all alarm components that extend from the basic componentType
func (s *twinMakerHandler) GetAlarms(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
	failures := []data.Notice{}
	alarmComponentType := "com.amazon.iottwinmaker.alarm.basic"
	externalIdKey := "alarm_key"
	alarmProperty := "alarm_status"
	isFiltered := len(query.PropertyFilter) > 0
	var maxResults int
	isLimited := false
	if query.MaxResults > 0 {
		isLimited = true
		maxResults = query.MaxResults
	}

	var filter []models.TwinMakerPropertyFilter
	if isFiltered {
		filter = query.PropertyFilter
		query.PropertyFilter = nil
	}

	// Get all componentTypes that extend from the base alarm type
	query.ComponentTypeId = alarmComponentType
	componentTypes, err := s.client.ListComponentTypes(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}
	if componentTypes == nil {
		dr.Error = fmt.Errorf("error loading componentTypes for GetAlarms query")
		return
	}

	// Get the propertyValueHistory associated with all componentTypes from above
	var pValues []PropertyReference

	for _, componentTypeSummary := range componentTypes.ComponentTypeSummaries {
		// Set mapping of alarm component types for quick lookup later
		query.EntityId = ""
		query.Properties = []*string{aws.String(alarmProperty)}
		query.ComponentTypeId = *componentTypeSummary.ComponentTypeId
		query.Order = models.ResultOrderDesc
		if isFiltered {
			query.PropertyFilter = filter
		}

		propertyReferences, newFailures, err := s.GetLatestComponentHistoryWithLookup(ctx, query)
		dr.Error = err
		if err != nil {
			return
		}
		failures = append(failures, newFailures...)
		pValues = append(pValues, propertyReferences...)
		if isLimited && len(pValues) >= maxResults {
			if len(pValues) > maxResults {
				pValues = pValues[:maxResults]
			}
			break
		}
	}

	fields := newTwinMakerFrameBuilder(len(pValues))
	name := fields.Name()
	name.Name = "alarmName"
	id := fields.AlarmId()
	eId := fields.EntityID()
	eName := fields.Name()
	eName.Name = "entityName"
	status := fields.AlarmStatus()
	status.Config = &data.FieldConfig{
		DisplayName: "Status",
		Custom: map[string]interface{}{
			// Table panel
			"displayMode": "color-text",
		},
		Mappings: data.ValueMappings{
			data.ValueMapper{
				"NORMAL": {
					Color: "green",
					Index: 0,
					Text:  "NORMAL",
				},
				"ACTIVE": data.ValueMappingResult{
					Color: "red",
					Index: 1,
					Text:  "ACTIVE",
				},
				"SNOOZE_DISABLED": {
					Color: "orange",
					Index: 2,
					Text:  "SNOOZE_DISABLED",
				},
				"ACKNOWLEDGED": {
					Color: "blue",
					Index: 3,
					Text:  "ACKNOWLEDGED",
				},
			},
		},
	}
	t := fields.Time()

	for i, propertyReference := range pValues {
		aValues := len(propertyReference.values)
		if aValues > 0 {
			if timeValue, err := getTimeObjectFromStringTime(propertyReference.values[0].Time); err == nil {
				t.Set(i, timeValue)
			} else {
				dr.Error = fmt.Errorf("error parsing timestamp during GetAlarms query")
			}
			status.Set(i, propertyReference.values[0].Value.StringValue)
		}
		name.Set(i, propertyReference.entityPropertyReference.ComponentName)
		id.Set(i, propertyReference.entityPropertyReference.ExternalIdProperty[externalIdKey])
		eId.Set(i, propertyReference.entityPropertyReference.EntityId)
		eName.Set(i, propertyReference.entityName)
	}
	frame := fields.ToFrame("", nil)
	frame.AppendNotices(failures...)
	dr.Frames = append(dr.Frames, frame)

	return
}

func (s *twinMakerHandler) GetSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (models.TokenInfo, error) {
	info := models.TokenInfo{}
	credentials, err := s.client.GetSessionToken(ctx, duration, workspaceId)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case sts.ErrCodeRegionDisabledException:
				fmt.Println(sts.ErrCodeRegionDisabledException, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}
		return info, err
	}

	info.AccessKeyId = credentials.AccessKeyId
	info.SecretAccessKey = credentials.SecretAccessKey
	info.SessionToken = credentials.SessionToken
	if credentials.Expiration != nil {
		info.Expiration = credentials.Expiration.UnixNano() / int64(time.Millisecond)
	}

	return info, err
}
