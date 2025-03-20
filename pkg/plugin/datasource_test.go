package plugin_test

import (
	"context"
	"testing"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/plugin"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

func TestCheckHealthHandler(t *testing.T) {
	t.Run("HealthStatusError when cannot connect", func(t *testing.T) {
		ds := plugin.NewTwinMakerDatasource(context.Background(), models.TwinMakerDataSourceSetting{
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AccessKey:     "sdkhfbhkdshjf",
				SecretKey:     "sdafdsfdsf",
				AuthType:      awsds.AuthTypeKeys,
				Region:        "us-east-1",
				AssumeRoleARN: "arn:abcefhtogjslghs:aws:ssafg",
			},
			WorkspaceID: "aaa",
		})

		res, _ := ds.CheckHealth(
			context.Background(),
			&backend.CheckHealthRequest{},
		)

		require.Equal(t, res.Status, backend.HealthStatusError)
		require.Contains(t, res.Message, "InvalidClientTokenId: The security token included in the request is invalid.")
	})
	t.Run("HealthStatusError when assume role arn is not filled out", func(t *testing.T) {
		ds := plugin.NewTwinMakerDatasource(context.Background(), models.TwinMakerDataSourceSetting{
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AccessKey: "sdkhfbhkdshjf",
				SecretKey: "sdafdsfdsf",
				AuthType:  awsds.AuthTypeKeys,
				Region:    "us-east-1",
			},
			WorkspaceID: "aaa",
		})

		res, _ := ds.CheckHealth(
			context.Background(),
			&backend.CheckHealthRequest{},
		)

		require.Equal(t, res.Status, backend.HealthStatusError)
		require.Contains(t, res.Message, "Assume Role ARN is required")
	})
	t.Run("HealthStatusOK when can connect", func(t *testing.T) {
		t.Skip()
		ds := plugin.NewTwinMakerDatasource(context.Background(), models.TwinMakerDataSourceSetting{
			AWSDatasourceSettings: awsds.AWSDatasourceSettings{
				AccessKey:     "sdkhfbhkdshjf",
				SecretKey:     "sdafdsfdsf",
				AuthType:      awsds.AuthTypeKeys,
				Region:        "us-east-1",
				AssumeRoleARN: "abc",
			},
			WorkspaceID: "aaa",
		})

		res, _ := ds.CheckHealth(
			context.Background(),
			&backend.CheckHealthRequest{},
		)

		require.Equal(t, res.Status, backend.HealthStatusOk)
		require.Equal(t, res.Message, "OK (did not really check anything)")
	})
}
