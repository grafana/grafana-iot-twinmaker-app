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

type alarm struct {
	time       *time.Time
	name       *string
	status     *string
	id         *string
	entityId   *string
	entityName *string
}

func (a *alarm) sortString() string {
	t := time.Unix(0, 0)
	if a.time != nil {
		t = *a.time
	}

	e := "ent"
	if a.entityName != nil {
		e = *a.entityName
	}

	n := "__"
	if a.name != nil {
		n = *a.name
	}

	return fmt.Sprintf("%v/%v/%v", t, e, n)
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

	frame := data.NewFrame("")
	propVals := make([]string, 0, len(results.PropertyValues))
	for k := range results.PropertyValues {
		propVals = append(propVals, k)
	}
	sort.Strings(propVals)

	for _, propVal := range propVals {
		prop := results.PropertyValues[propVal]
		if v := prop.PropertyValue.ListValue; v != nil {
			frame = s.processListValue(v)
			frame.Name = *prop.PropertyReference.PropertyName
			continue
		}
		if v := prop.PropertyValue.MapValue; v != nil {
			frame = s.processMapValue(v)
			frame.Name = *prop.PropertyReference.PropertyName
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

func (s *twinMakerHandler) processListValue(v []*iottwinmaker.DataValue) *data.Frame {
	fields := newTwinMakerFrameBuilder(len(v))

	valField, valConvertor := fields.Value(v[0])
	valField.Name = "Value"

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

func (s *twinMakerHandler) processHistory(results *iottwinmaker.GetPropertyValueHistoryOutput, err error, query models.TwinMakerQuery) (dr backend.DataResponse) {
	dr.Error = err
	if err != nil {
		return
	}

	for _, prop := range results.PropertyValues {
		if len(prop.Values) == 0 {
			continue
		}
		fields := newTwinMakerFrameBuilder(len(prop.Values))
		t := fields.Time()
		v, conv := fields.Value(prop.Values[0].Value)
		v.Name = "" // filled in with value below
		for i, history := range prop.Values {
			t.Set(i, history.Timestamp)
			v.Set(i, conv(history.Value))
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
		dr.Frames = append(dr.Frames, frame)
	}
	return
}

func (s *twinMakerHandler) GetComponentHistory(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse {
	if query.ComponentTypeId == "" {
		return backend.DataResponse{
			Error: fmt.Errorf("missing component parameter"),
		}
	}

	result, err := s.client.GetPropertyValueHistory(ctx, query)
	return s.processHistory(result, err, query)
}

func (s *twinMakerHandler) GetEntityHistory(ctx context.Context, query models.TwinMakerQuery) backend.DataResponse {
	if query.EntityId == "" {
		return backend.DataResponse{
			Error: fmt.Errorf("missing entity parameter"),
		}
	}
	result, err := s.client.GetPropertyValueHistory(ctx, query)
	return s.processHistory(result, err, query)
}

// return status and value here
func (s *twinMakerHandler) GetAlarms(ctx context.Context, query models.TwinMakerQuery) (dr backend.DataResponse) {
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
	alarmComponentTypes := map[string]*iottwinmaker.ComponentTypeSummary{}
	query.ComponentTypeId = alarmComponentType
	componentTypes, err := s.client.ListComponentTypes(ctx, query)
	dr.Error = err
	if err != nil {
		return
	}

	// Get the propertyValueHistory associated with all componentTypes from above
	var pValues []*iottwinmaker.PropertyValueHistory
	for _, componentTypeSummary := range componentTypes.ComponentTypeSummaries {
		// Set mapping of alarm component types for quick lookup later
		alarmComponentTypes[*componentTypeSummary.ComponentTypeId] = componentTypeSummary
		query.EntityId = ""
		query.Properties = []*string{aws.String(alarmProperty)}
		query.ComponentTypeId = *componentTypeSummary.ComponentTypeId
		if isFiltered {
			query.PropertyFilter = filter
		}
		p, err := s.client.GetPropertyValueHistory(ctx, query)
		dr.Error = err
		if err != nil {
			return
		}
		pValues = append(pValues, p.PropertyValues...)
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

	query.EntityId = ""
	query.Properties = nil
	query.ComponentTypeId = ""
	failures := []data.Notice{}
	for i, alarm := range pValues {
		externalId := alarm.EntityPropertyReference.ExternalIdProperty[externalIdKey]
		query.ListEntitiesFilter = []models.TwinMakerListListEntitiesFilter{
			{
				ExternalId: *externalId,
			},
		}
		le, err := s.client.ListEntities(ctx, query)

		if err != nil {
			notice := data.Notice{
				Severity: data.NoticeSeverityWarning,
				Text:     err.Error(),
			}
			failures = append(failures, notice)
			break
		}
		entityId := le.EntitySummaries[0].EntityId
		entityName := le.EntitySummaries[0].EntityName
		query.EntityId = *entityId
		e, err := s.client.GetEntity(ctx, query)
		if err != nil {
			notice := data.Notice{
				Severity: data.NoticeSeverityWarning,
				Text:     err.Error(),
			}
			failures = append(failures, notice)
			break
		}
		componentName := ""
		for _, component := range e.Components {
			_, isAlarm := alarmComponentTypes[*component.ComponentTypeId]
			if isAlarm {
				for propertyKey, propertyValue := range component.Properties {
					if propertyKey == "alarm_key" {
						if *propertyValue.Value.StringValue == *externalId {
							componentName = *component.ComponentName
							break
						}
					}
				}
				break
			}
		}
		aValues := len(alarm.Values)
		t.Set(i, alarm.Values[aValues-1].Timestamp)
		name.Set(i, &componentName)
		status.Set(i, alarm.Values[aValues-1].Value.StringValue)
		id.Set(i, externalId)
		eId.Set(i, entityId)
		eName.Set(i, entityName)
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
