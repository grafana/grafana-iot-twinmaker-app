package twinmaker

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestFetchAWSData(t *testing.T) {
	t.Run("get a sts token with inline policy enforced", func(t *testing.T) {
		t.Skip()

		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType:      awsds.AuthTypeDefault,
				AssumeRoleARN: "arn:aws:iam::166800769179:role/IoTTwinMakerDashboardRole-8cf9aa9e",
				Region:        "us-east-1",
			},
		})
		require.NoError(t, err)

		WorkspaceId := "AlarmWorkspace"
		token, err := c.GetSessionToken(context.Background(), time.Second*3600, WorkspaceId)
		require.NoError(t, err)
		require.NotEmpty(t, token)
	})

	t.Run("throw error when assume role arn is missing", func(t *testing.T) {
		t.Skip()
		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType:     awsds.AuthTypeKeys,
				AccessKey:    "dummyAccessKeyId",
				SecretKey:    "dummySecretKeyId",
				SessionToken: "dummySessionToken", // this means creds are already temp
			},
		})
		require.NoError(t, err)

		WorkspaceId := "GrafanaWorkspace"
		_, err = c.GetSessionToken(context.Background(), time.Second*3600, WorkspaceId)
		require.Error(t, err)
	})

	t.Run("manually get an sts token when creds are permanent", func(t *testing.T) {
		t.Skip()

		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType:      awsds.AuthTypeDefault,
				AssumeRoleARN: "arn:aws:iam::166800769179:role/IoTTwinMakerDashboardRole-8cf9aa9e",
				Region:        "us-east-1",
			},
		})
		require.NoError(t, err)

		WorkspaceId := "AlarmWorkspace"
		token, err := c.GetSessionToken(context.Background(), time.Second*3600, WorkspaceId)
		require.NoError(t, err)

		writeTestData("get-token", token, t)
	})

	t.Run("manually query twinmaker", func(t *testing.T) {
		t.Skip()

		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType: awsds.AuthTypeDefault,
				Region:   "us-east-1",
			},
		})
		require.NoError(t, err)

		w, err := c.ListWorkspaces(context.Background(), models.TwinMakerQuery{})
		require.NoError(t, err)
		writeTestData("list-workspaces", w, t)

		s, err := c.ListScenes(context.Background(), models.TwinMakerQuery{
			WorkspaceId: "AlarmWorkspace",
		})
		require.NoError(t, err)
		writeTestData("list-scenes", s, t)

		e, err := c.ListEntities(context.Background(), models.TwinMakerQuery{
			WorkspaceId: "AlarmWorkspace",
		})
		require.NoError(t, err)
		writeTestData("list-entities", e, t)

		ct, err := c.ListComponentTypes(context.Background(), models.TwinMakerQuery{
			WorkspaceId: "AlarmWorkspace",
		})
		require.NoError(t, err)
		writeTestData("list-component-types", ct, t)

		ci, err := c.GetComponentType(context.Background(), models.TwinMakerQuery{
			WorkspaceId:     "AlarmWorkspace",
			ComponentTypeId: "com.example.cookiefactory.alarm",
		})
		require.NoError(t, err)
		writeTestData("get-component-type", ci, t)

		g, err := c.GetEntity(context.Background(), models.TwinMakerQuery{
			EntityId:    "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			WorkspaceId: "AlarmWorkspace",
		})
		require.NoError(t, err)
		writeTestData("get-entity", g, t)

		pv, err := c.GetPropertyValue(context.Background(), models.TwinMakerQuery{
			EntityId:      "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			WorkspaceId:   "AlarmWorkspace",
			Properties:    []string{"alarm_key", "telemetryAssetType"},
			ComponentName: "AlarmComponent",
		})
		require.NoError(t, err)
		writeTestData("get-property-value", pv, t)

		// List data type property
		pv, err = c.GetPropertyValue(context.Background(), models.TwinMakerQuery{
			EntityId:      "Factory_aa3d7d8b-6b94-44fe-ab02-6936bfcdade6",
			WorkspaceId:   "AlarmWorkspace",
			Properties:    []string{"bounds"},
			ComponentName: "Space",
		})
		require.NoError(t, err)
		writeTestData("get-property-value-list", pv, t)

		// Map data type property
		pv, err = c.GetPropertyValue(context.Background(), models.TwinMakerQuery{
			EntityId:      "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			WorkspaceId:   "AlarmWorkspace",
			Properties:    []string{"documents"},
			ComponentName: "SpecSheets",
		})
		require.NoError(t, err)
		writeTestData("get-property-value-map", pv, t)

		// check the combination: entityId -> componentName -> propertyName(s)
		p, err := c.GetPropertyValueHistory(context.Background(), models.TwinMakerQuery{
			EntityId:    "Mixer_1_4b57cbee-c391-4de6-b882-622c633a697e",
			WorkspaceId: "AlarmWorkspace",
			TimeRange: backend.TimeRange{
				From: time.Date(2022, 4, 27, 0, 0, 0, 0, time.UTC),
				To:   time.Date(2022, 4, 27, 23, 0, 0, 0, time.UTC),
			},
			Properties:    []string{"alarm_status"},
			ComponentName: "AlarmComponent",
		})
		require.NoError(t, err)
		writeTestData("get-property-history-alarms", p, t)

		// check the combination: componentTypeId -> propertyName(s)
		p, err = c.GetPropertyValueHistory(context.Background(), models.TwinMakerQuery{
			WorkspaceId: "AlarmWorkspace",
			TimeRange: backend.TimeRange{
				From: time.Date(2022, 4, 27, 0, 0, 0, 0, time.UTC),
				To:   time.Date(2022, 4, 27, 23, 0, 0, 0, time.UTC),
			},
			Properties:      []string{"alarm_status"},
			ComponentTypeId: "com.example.cookiefactory.alarm",
			PropertyFilter: []models.TwinMakerPropertyFilter{
				{
					Name:  "alarm_status",
					Value: models.TwinMakerFilterValue{StringValue: aws.String("ACTIVE")},
					Op:    "=",
				},
			},
		})
		require.NoError(t, err)
		writeTestData("get-property-history-alarms-w-id", p, t)
	})

	t.Run("athena connector test no filter", func(t *testing.T) {
		t.Skip()

		c, err := NewTwinMakerClient(context.Background(), models.TwinMakerDataSourceSetting{
			// use credentials in ~/.aws/credentials
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AuthType: awsds.AuthTypeDefault,
				Region:   "us-east-1",
			},
		})
		require.NoError(t, err)

		pv, err := c.GetPropertyValue(context.Background(), models.TwinMakerQuery{
			EntityId:          "1b480741-1ac9-4c28-ac0e-f815b4bb3347",
			WorkspaceId:       "tabular-test-1",
			Properties:        []string{"crit", "description", "floc"},
			ComponentName:     "TabularComponent",
			PropertyGroupName: "tabularPropertyGroup",
		})
		require.NoError(t, err)
		writeTestData("get-property-value-athena", pv, t)
	})
}

// This will write the results to local json file
//
//nolint:golint,unused
func writeTestData(filename string, res interface{}, t *testing.T) {
	json, err := json.MarshalIndent(res, "", "    ")
	if err != nil {
		fmt.Println("marshalling results failed", err.Error())
	}

	f, err := os.Create("./testdata/" + filename + ".json")
	if err != nil {
		fmt.Println("create file failed: ", filename)
	}

	defer func() {
		cerr := f.Close()
		if err == nil {
			err = cerr
		}
	}()

	_, err = f.Write(json)
	if err != nil {
		fmt.Println("write file failed: ", filename)
	}
}
