package twinmaker

import (
	"context"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/stretchr/testify/require"
)

func TestHandleAWSData(t *testing.T) {
	client, err := NewTwinMakerMockClient("x")
	require.NoError(t, err)
	handler := NewTwinMakerHandler(client)

	t.Run("manually get an sts token", func(t *testing.T) {
		client.path = "get-token"
		WorkspaceId := "AlarmWorkspace"
		token, err := handler.GetSessionToken(context.Background(), time.Second*3600, WorkspaceId)
		require.NoError(t, err)
		require.NotEmpty(t, token)
	})

	t.Run("run ListWorkspaces handler", func(t *testing.T) {
		client.path = "list-workspaces"
		resp := handler.ListWorkspaces(context.Background(), models.TwinMakerQuery{})
		_ = runTest(t, client.path, &resp)
	})

	t.Run("run ListScenes handler", func(t *testing.T) {
		client.path = "list-scenes"
		resp := handler.ListScenes(context.Background(), models.TwinMakerQuery{})
		_ = runTest(t, client.path, &resp)
	})

	t.Run("run ListEntities handler", func(t *testing.T) {
		client.path = "list-entities"
		resp := handler.ListEntities(context.Background(), models.TwinMakerQuery{})
		_ = runTest(t, client.path, &resp)
	})

	t.Run("run ListComponentTypes handler", func(t *testing.T) {
		client.path = "list-component-types"
		resp := handler.ListComponentTypes(context.Background(), models.TwinMakerQuery{})
		_ = runTest(t, client.path, &resp)
	})

	t.Run("run GetEntity handler", func(t *testing.T) {
		client.path = "get-entity"
		resp := handler.GetEntity(context.Background(), models.TwinMakerQuery{})
		_ = runTest(t, client.path, &resp)
	})

	t.Run("run GetPropertyValue handler", func(t *testing.T) {
		client.path = "get-property-value"
		resp := handler.GetPropertyValue(context.Background(), models.TwinMakerQuery{})
		dr := runTest(t, client.path, &resp)
		labels := data.Labels{
			"componentName": "AlarmComponent",
			"entityId":      "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			"propertyName":  "telemetryAssetType",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[1].Labels)
		labels = data.Labels{
			"componentName": "AlarmComponent",
			"entityId":      "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			"propertyName":  "alarm_key",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[0].Labels)
	})

	t.Run("run GetPropertyValue handler w list", func(t *testing.T) {
		client.path = "get-property-value-list"
		resp := handler.GetPropertyValue(context.Background(), models.TwinMakerQuery{})
		runTest(t, client.path, &resp)
	})

	t.Run("run GetPropertyValue handler w map", func(t *testing.T) {
		client.path = "get-property-value-map"
		resp := handler.GetPropertyValue(context.Background(), models.TwinMakerQuery{})
		runTest(t, client.path, &resp)
	})

	t.Run("run GetPropertyValue handler for athena connector", func(t *testing.T) {
		client.path = "get-property-value-athena"
		resp := handler.GetPropertyValue(context.Background(), models.TwinMakerQuery{
			WorkspaceId:       "tabular-test-1",
			EntityId:          "1b480741-1ac9-4c28-ac0e-f815b4bb3347",
			ComponentName:     "TabularComponent",
			Properties:        []string{"crit", "description", "floc"},
			PropertyGroupName: "tabularPropertyGroup",
		})
		dr := runTest(t, client.path, &resp)
		labels := data.Labels{
			"componentName": "TabularComponent",
			"entityId":      "1b480741-1ac9-4c28-ac0e-f815b4bb3347",
			"propertyName":  "description",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[1].Labels)
		labels = data.Labels{
			"componentName": "TabularComponent",
			"entityId":      "1b480741-1ac9-4c28-ac0e-f815b4bb3347",
			"propertyName":  "crit",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[0].Labels)
	})

	t.Run("run GetEntityHistory handler", func(t *testing.T) {
		client.path = "get-property-history-alarms"
		resp := handler.GetEntityHistory(context.Background(), models.TwinMakerQuery{
			EntityId:      "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			ComponentName: "AlarmComponent",
		})
		dr := runTest(t, client.path, &resp)
		labels := data.Labels{
			"componentName": "AlarmComponent",
			"entityId":      "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			"propertyName":  "alarm_status",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[0].Labels)
	})

	t.Run("run GetComponentHistory handler w id", func(t *testing.T) {
		t.Skip()
		// cannot use the mock client here since this uses different API calls
		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType: awsds.AuthTypeDefault,
				Region:   "us-east-1",
			},
		})
		require.NoError(t, err)
		handler := NewTwinMakerHandler(c)

		client.path = "get-property-history-alarms-w-id"
		resp := handler.GetComponentHistory(context.Background(), models.TwinMakerQuery{
			WorkspaceId: "AlarmWorkspace",
			TimeRange: backend.TimeRange{
				From: time.Date(2022, 4, 27, 0, 0, 0, 0, time.UTC),
				To:   time.Date(2022, 4, 27, 23, 0, 0, 0, time.UTC),
			},
			ComponentTypeId: "com.example.cookiefactory.alarm",
			Properties:      []string{"alarm_status"},
			PropertyFilter: []models.TwinMakerPropertyFilter{
				{
					Name: "alarm_status",
					Value: models.TwinMakerFilterValue{
						StringValue: aws.String("ACTIVE"),
					},
					Op: "=",
				},
			},
			Order: "DESCENDING",
		})
		dr := runTest(t, client.path, &resp)
		labels := data.Labels{
			"entityId":      "WaterTank_ab5e8bc0-5c8f-44d8-b0a9-bef9c8d2cfab",
			"componentName": "AlarmComponent",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[0].Labels)
		labels["entityId"] = "Mixer_0_cd81d9fd-3f74-437a-802b-9747ff240837"
		require.Equal(t, labels, dr.Frames[1].Fields[0].Labels)
		labels["entityId"] = "Mixer_4_784b3c3e-5779-4ca1-ad0b-036b18dd1fcc"
		require.Equal(t, labels, dr.Frames[2].Fields[0].Labels)
		labels["entityId"] = "Mixer_10_9ee8913d-1fef-4453-beee-fbfc147fc03c"
		require.Equal(t, labels, dr.Frames[3].Fields[0].Labels)
	})

	t.Run("run GetAlarms handler", func(t *testing.T) {
		t.Skip()
		// cannot use the mock client here since no real API call exists for this
		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType: awsds.AuthTypeDefault,
				Region:   "us-east-1",
			},
		})
		require.NoError(t, err)
		handler := NewTwinMakerHandler(c)

		client.path = "get-alarms"
		resp := handler.GetAlarms(context.Background(), models.TwinMakerQuery{
			WorkspaceId: "AlarmWorkspace",
			TimeRange: backend.TimeRange{
				From: time.Date(2022, 4, 27, 0, 0, 0, 0, time.UTC),
				To:   time.Date(2022, 4, 27, 23, 0, 0, 0, time.UTC),
			},
			PropertyFilter: []models.TwinMakerPropertyFilter{
				{
					Name: "alarm_status",
					Value: models.TwinMakerFilterValue{
						StringValue: aws.String("ACTIVE"),
					},
					Op: "=",
				},
			},
		})
		_ = runTest(t, client.path, &resp)
	})
}

func runTest(t *testing.T, name string, dr *backend.DataResponse) *backend.DataResponse {
	experimental.CheckGoldenJSONResponse(t, "./testdata", name+".golden", dr, true)

	return dr
}
