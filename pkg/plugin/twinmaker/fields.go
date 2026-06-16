package twinmaker

import (
	"fmt"
	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"

	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type twinMakerFrameBuilder struct {
	len    int
	fields []*data.Field
}

func newTwinMakerFrameBuilder(len int) twinMakerFrameBuilder {
	return twinMakerFrameBuilder{len: len, fields: make([]*data.Field, 0, 10)}
}

func (r *twinMakerFrameBuilder) ToFrame(name string, nextToken *string) *data.Frame {
	f := data.NewFrame(name, r.fields...)
	meta := models.TwinMakerCustomMeta{}
	if nextToken != nil {
		meta.NextToken = *nextToken
	}
	f.SetMeta(&data.FrameMeta{
		Custom: meta,
	})
	return f
}

func (r *twinMakerFrameBuilder) add(f *data.Field, name string) *data.Field {
	f.Name = name
	r.fields = append(r.fields, f)
	return f
}

func (r *twinMakerFrameBuilder) Time() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableTime, r.len)
	return r.add(f, data.TimeSeriesTimeFieldName)
}

func newDataValueField(v *iottwinmakertypes.DataValue, count int) (*data.Field, func(v *iottwinmakertypes.DataValue) interface{}) {
	if val := v.BooleanValue; val != nil {
		f := data.NewFieldFromFieldType(data.FieldTypeNullableBool, count)
		c := func(v *iottwinmakertypes.DataValue) interface{} {
			return v.BooleanValue
		}
		return f, c
	}

	if val := v.DoubleValue; val != nil {
		f := data.NewFieldFromFieldType(data.FieldTypeNullableFloat64, count)
		c := func(v *iottwinmakertypes.DataValue) interface{} {
			return v.DoubleValue
		}
		return f, c
	}

	if val := v.LongValue; val != nil {
		f := data.NewFieldFromFieldType(data.FieldTypeNullableInt64, count)
		c := func(v *iottwinmakertypes.DataValue) interface{} {
			return v.LongValue
		}
		return f, c
	}

	if val := v.IntegerValue; val != nil {
		f := data.NewFieldFromFieldType(data.FieldTypeNullableInt32, count)
		c := func(v *iottwinmakertypes.DataValue) interface{} {
			return v.IntegerValue
		}
		return f, c
	}

	if val := v.StringValue; val != nil {
		f := data.NewFieldFromFieldType(data.FieldTypeNullableString, count)
		c := func(v *iottwinmakertypes.DataValue) interface{} {
			return v.StringValue
		}
		return f, c
	}

	f := data.NewFieldFromFieldType(data.FieldTypeString, count)
	c := func(v *iottwinmakertypes.DataValue) interface{} {
		return fmt.Sprintf("%v", v)
	}
	return f, c
}

func (r *twinMakerFrameBuilder) Value(v *iottwinmakertypes.DataValue) (*data.Field, func(v *iottwinmakertypes.DataValue) interface{}) {
	f, c := newDataValueField(v, r.len)
	return r.add(f, data.TimeSeriesValueFieldName), c
}

func (r *twinMakerFrameBuilder) ARN() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "arn")
}

func (r *twinMakerFrameBuilder) CreationDate() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeTime, r.len)
	return r.add(f, "created")
}

func (r *twinMakerFrameBuilder) Description() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "description")
}

func (r *twinMakerFrameBuilder) WorkspaceID() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "workspaceId")
}

func (r *twinMakerFrameBuilder) SceneId() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "sceneId")
}

func (r *twinMakerFrameBuilder) EntityID() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "entityId")
}

func (r *twinMakerFrameBuilder) ComponentID() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "componentId")
}

func (r *twinMakerFrameBuilder) Configuration() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "configuration")
}

func (r *twinMakerFrameBuilder) DataType() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeString, r.len)
	return r.add(f, "dataType")
}

func (r *twinMakerFrameBuilder) IsTimeSeries() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeBool, r.len)
	return r.add(f, "isTimeSeries")
}

func (r *twinMakerFrameBuilder) UnitOfMeasure() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "unitOfMeasure")
}

func (r *twinMakerFrameBuilder) Component() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeString, r.len)
	return r.add(f, "component")
}

func (r *twinMakerFrameBuilder) ComponentTypeId() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeString, r.len)
	return r.add(f, "componentTypeId")
}

func (r *twinMakerFrameBuilder) PropertiesInfo() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeString, r.len)
	f.Config = &data.FieldConfig{
		Custom: map[string]interface{}{
			// Table panel
			"displayMode": "json-view",
		},
	}
	return r.add(f, "properties")
}

func (r *twinMakerFrameBuilder) Property() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeString, r.len)
	return r.add(f, "property")
}

// common for entity, component, alarms etc
func (r *twinMakerFrameBuilder) Name() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "name")
}

func (r *twinMakerFrameBuilder) AlarmId() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "alarmId")
}

func (r *twinMakerFrameBuilder) AlarmStatus() *data.Field {
	f := data.NewFieldFromFieldType(data.FieldTypeNullableString, r.len)
	return r.add(f, "alarmStatus")
}

// // CreationDate is a required field
// CreationDate *time.Time `locationName:"creationDate" type:"timestamp" required:"true"`

// CreationDateTime *time.Time `locationName:"creationDateTime" type:"timestamp"`

// Description *string `locationName:"description" type:"string"`

// // LastUpdateDate is a required field
// LastUpdateDate *time.Time `locationName:"lastUpdateDate" type:"timestamp" required:"true"`

// UpdateDateTime *time.Time `locationName:"updateDateTime" type:"timestamp"`

// // WorkspaceArn is a required field
// WorkspaceArn *string `locationName:"workspaceArn" min:"20" type:"string" required:"true"`

// // WorkspaceId is a required field
// WorkspaceId *string `locationName:"workspaceId" min:"1" type:"string" required:"true"`
