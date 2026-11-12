package twinmaker

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"
	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"

	"github.com/stretchr/testify/require"
)

// spyClient embeds a nil TwinMakerClient so only the method under test needs
// implementing; any other method being called would panic, which none of
// these tests expect.
type spyClient struct {
	TwinMakerClient
	batchPutPropertyValuesCalled bool
	lastPutInput                 *iottwinmaker.BatchPutPropertyValuesInput
}

func (s *spyClient) BatchPutPropertyValues(ctx context.Context, req *iottwinmaker.BatchPutPropertyValuesInput) (*iottwinmaker.BatchPutPropertyValuesOutput, error) {
	s.batchPutPropertyValuesCalled = true
	s.lastPutInput = req
	return &iottwinmaker.BatchPutPropertyValuesOutput{}, nil
}

func validAlarmThresholdEntry() iottwinmakertypes.PropertyValueEntry {
	return iottwinmakertypes.PropertyValueEntry{
		EntityPropertyReference: &iottwinmakertypes.EntityPropertyReference{
			EntityId:      aws.String("entity-1"),
			ComponentName: aws.String("AlarmComponent"),
			PropertyName:  aws.String("alarm_threshold"),
		},
		PropertyValues: []iottwinmakertypes.PropertyValue{
			{Value: &iottwinmakertypes.DataValue{DoubleValue: aws.Float64(42)}},
		},
	}
}

func TestValidatePropertyValueEntries(t *testing.T) {
	t.Run("accepts the single alarm_threshold entry the panel sends", func(t *testing.T) {
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{validAlarmThresholdEntry()})
		require.NoError(t, err)
	})

	t.Run("rejects more than one entry", func(t *testing.T) {
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{validAlarmThresholdEntry(), validAlarmThresholdEntry()})
		require.Error(t, err)
	})

	t.Run("rejects writing a different property", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.EntityPropertyReference.PropertyName = aws.String("some_other_property")
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects missing entityId", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.EntityPropertyReference.EntityId = nil
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects missing componentName", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.EntityPropertyReference.ComponentName = nil
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects componentPath", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.EntityPropertyReference.ComponentPath = aws.String("Parent/Child")
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects externalIdProperty", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.EntityPropertyReference.ExternalIdProperty = map[string]string{"id": "prop"}
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects a non-numeric value", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.PropertyValues[0].Value = &iottwinmakertypes.DataValue{StringValue: aws.String("not a number")}
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects more than one property value", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.PropertyValues = append(entry.PropertyValues, entry.PropertyValues[0])
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
	})

	t.Run("rejects doubleValue combined with any other DataValue field", func(t *testing.T) {
		extras := map[string]func(v *iottwinmakertypes.DataValue){
			"booleanValue":      func(v *iottwinmakertypes.DataValue) { v.BooleanValue = aws.Bool(true) },
			"expression":        func(v *iottwinmakertypes.DataValue) { v.Expression = aws.String("1+1") },
			"integerValue":      func(v *iottwinmakertypes.DataValue) { v.IntegerValue = aws.Int32(1) },
			"listValue":         func(v *iottwinmakertypes.DataValue) { v.ListValue = []iottwinmakertypes.DataValue{} },
			"longValue":         func(v *iottwinmakertypes.DataValue) { v.LongValue = aws.Int64(1) },
			"mapValue":          func(v *iottwinmakertypes.DataValue) { v.MapValue = map[string]iottwinmakertypes.DataValue{} },
			"relationshipValue": func(v *iottwinmakertypes.DataValue) { v.RelationshipValue = &iottwinmakertypes.RelationshipValue{} },
			"stringValue":       func(v *iottwinmakertypes.DataValue) { v.StringValue = aws.String("x") },
		}
		for name, set := range extras {
			t.Run(name, func(t *testing.T) {
				entry := validAlarmThresholdEntry()
				set(entry.PropertyValues[0].Value)
				err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
				require.Error(t, err)
			})
		}
	})

	t.Run("accepts a zero threshold", func(t *testing.T) {
		entry := validAlarmThresholdEntry()
		entry.PropertyValues[0].Value = &iottwinmakertypes.DataValue{DoubleValue: aws.Float64(0)}
		err := validatePropertyValueEntries([]iottwinmakertypes.PropertyValueEntry{entry})
		require.NoError(t, err)
	})
}

func TestResourceBatchPutPropertyValues(t *testing.T) {
	t.Run("rejected entries never reach the AWS client", func(t *testing.T) {
		spy := &spyClient{}
		res := NewTwinMakerResource(spy, "workspace-1")

		entry := validAlarmThresholdEntry()
		entry.EntityPropertyReference.PropertyName = aws.String("some_other_property")

		_, err := res.BatchPutPropertyValues(context.Background(), []iottwinmakertypes.PropertyValueEntry{entry})
		require.Error(t, err)
		require.False(t, spy.batchPutPropertyValuesCalled)
	})

	t.Run("a valid entry reaches the AWS client", func(t *testing.T) {
		spy := &spyClient{}
		res := NewTwinMakerResource(spy, "workspace-1")

		_, err := res.BatchPutPropertyValues(context.Background(), []iottwinmakertypes.PropertyValueEntry{validAlarmThresholdEntry()})
		require.NoError(t, err)
		require.True(t, spy.batchPutPropertyValuesCalled)
	})

	t.Run("replaces client-supplied timestamps with server time", func(t *testing.T) {
		spy := &spyClient{}
		res := NewTwinMakerResource(spy, "workspace-1")

		farFuture := time.Date(2099, 1, 1, 0, 0, 0, 0, time.UTC)
		entry := validAlarmThresholdEntry()
		entry.PropertyValues[0].Timestamp = &farFuture //nolint:staticcheck // the panel sends the deprecated field; the test proves it is dropped
		entry.PropertyValues[0].Time = aws.String("2099-01-01T00:00:00Z")

		before := time.Now().UTC().Add(-time.Second)
		_, err := res.BatchPutPropertyValues(context.Background(), []iottwinmakertypes.PropertyValueEntry{entry})
		after := time.Now().UTC().Add(time.Second)
		require.NoError(t, err)

		require.Equal(t, "workspace-1", *spy.lastPutInput.WorkspaceId)
		require.Len(t, spy.lastPutInput.Entries, 1)
		sent := spy.lastPutInput.Entries[0]
		require.Len(t, sent.PropertyValues, 1)
		pv := sent.PropertyValues[0]

		require.Nil(t, pv.Timestamp) //nolint:staticcheck // asserting the deprecated field is not forwarded
		require.NotNil(t, pv.Time)
		got, err := time.Parse(time.RFC3339Nano, *pv.Time)
		require.NoError(t, err)
		require.False(t, got.Before(before) || got.After(after), "time %s not within [%s, %s]", got, before, after)

		require.Equal(t, 42.0, *pv.Value.DoubleValue)
		require.Equal(t, entry.EntityPropertyReference, sent.EntityPropertyReference)
	})

	t.Run("does not mutate the caller's entries", func(t *testing.T) {
		spy := &spyClient{}
		res := NewTwinMakerResource(spy, "workspace-1")

		entry := validAlarmThresholdEntry()
		entry.PropertyValues[0].Time = aws.String("2099-01-01T00:00:00Z")

		_, err := res.BatchPutPropertyValues(context.Background(), []iottwinmakertypes.PropertyValueEntry{entry})
		require.NoError(t, err)
		require.Equal(t, "2099-01-01T00:00:00Z", *entry.PropertyValues[0].Time)
	})
}

func TestValidatePropertyValueEntriesFromWireJSON(t *testing.T) {
	decode := func(t *testing.T, body string) []iottwinmakertypes.PropertyValueEntry {
		var entries []iottwinmakertypes.PropertyValueEntry
		require.NoError(t, json.Unmarshal([]byte(body), &entries))
		return entries
	}
	ref := `{"entityId":"e","componentName":"c","propertyName":"alarm_threshold"%s}`
	val := `[{"value":{"doubleValue":1%s}}]`
	entry := func(refExtra, valExtra string) string {
		return `[{"entityPropertyReference":` + fmt.Sprintf(ref, refExtra) + `,"propertyValues":` + fmt.Sprintf(val, valExtra) + `}]`
	}

	require.NoError(t, validatePropertyValueEntries(decode(t, entry("", ""))))
	require.Error(t, validatePropertyValueEntries(decode(t, entry(`,"componentPath":"a/b"`, ""))))
	require.Error(t, validatePropertyValueEntries(decode(t, entry(`,"externalIdProperty":{}`, ""))))
	require.Error(t, validatePropertyValueEntries(decode(t, entry("", `,"stringValue":"x"`))))
	require.Error(t, validatePropertyValueEntries(decode(t, entry("", `,"listValue":[]`))))
}
