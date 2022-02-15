package twinmaker

import (
	"context"
	"testing"
	"time"

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
		WorkspaceId := "CookieFactory-11-16"
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
		}
		require.Equal(t, labels, dr.Frames[0].Fields[1].Labels)
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
		}
		require.Equal(t, labels, dr.Frames[0].Fields[1].Labels)
	})

	t.Run("run GetComponentHistory handler w id", func(t *testing.T) {
		client.path = "get-property-history-alarms-w-id"
		resp := handler.GetComponentHistory(context.Background(), models.TwinMakerQuery{
			ComponentTypeId: "xxx",
		})
		dr := runTest(t, client.path, &resp)
		labels := data.Labels{
			"alarm_key":       "Mixer_7_ca6b9bd9-6ace-433f-a095-da4b8ab53b1b",
			"componentTypeId": "xxx",
		}
		require.Equal(t, labels, dr.Frames[0].Fields[1].Labels)
		labels["alarm_key"] = "Mixer_3_f813ecad-e144-4105-a4dd-64b8070fe012"
		require.Equal(t, labels, dr.Frames[1].Fields[1].Labels)
		labels["alarm_key"] = "Mixer_1_597c735b-38fd-476c-b276-7592b1699ef8"
		require.Equal(t, labels, dr.Frames[2].Fields[1].Labels)
		labels["alarm_key"] = "Mixer_11_2ef76a9e-825b-4405-992f-f6fb401412ac"
		require.Equal(t, labels, dr.Frames[3].Fields[1].Labels)
	})

	t.Run("run GetAlarms handler", func(t *testing.T) {
		t.Skip()
		// cannot use the mock client here since no real API call exists for this
		c, err := NewTwinMakerClient(models.TwinMakerDataSourceSetting{
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
			WorkspaceId: "CookieFactory-11-29",
			TimeRange: backend.TimeRange{
				From: time.Date(2022, 1, 1, 8, 0, 0, 0, time.UTC),
				To:   time.Date(2022, 2, 13, 9, 0, 0, 0, time.UTC),
			},
			PropertyFilter: []models.TwinMakerPropertyFilter{
				{
					Name:  "alarm_status",
					Value: "ACTIVE",
					Op:    "=",
				},
			},
		})
		_ = runTest(t, client.path, &resp)
	})
}

func runTest(t *testing.T, name string, dr *backend.DataResponse) *backend.DataResponse {
	err := experimental.CheckGoldenDataResponse("./testdata/"+name+".golden.txt", dr, true)
	if err != nil {
		t.Errorf(err.Error())
	}

	return dr
}
