package twinmaker

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"testing"

	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestMatterportClient_GetAccessToken(t *testing.T) {
	t.Run("should return MatterportOAuthResponse", func(t *testing.T) {
		body := []byte(`{"access_token": "access_token", "token_type": "Bearer", "expires_in": 3600}`)
		rt := &fakeRoundTripper{
			res: &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewReader(body)),
			},
		}

		client := NewMatterportClient(rt)
		res, err := client.GetAccessToken(context.TODO(), models.MatterportOAuthSettings{
			ClientID:     "client_id",
			ClientSecret: "client_secret",
			RefreshToken: "refresh_token",
		})
		require.NoError(t, err)

		require.Equal(t, "access_token", res.AccessToken)
		require.Equal(t, "Bearer", res.TokenType)
		require.Equal(t, 3600, res.ExpiresIn)
	})
}

type fakeRoundTripper struct {
	res *http.Response
}

func (f *fakeRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	return f.res, nil
}
