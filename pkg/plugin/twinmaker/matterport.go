package twinmaker

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
)

const MATTERPORT_TOKEN_URL = "https://api.matterport.com/api/oauth/token"

type MatterportClient interface {
	GetAccessToken(ctx context.Context, mp models.MatterportOAuthSettings) (*models.MatterportOAuthResponse, error)
}

type matterportClient struct {
	roundTripper http.RoundTripper
}

func NewMatterportClient(rt http.RoundTripper) MatterportClient {
	return &matterportClient{roundTripper: rt}
}

func (c *matterportClient) GetAccessToken(ctx context.Context, mp models.MatterportOAuthSettings) (*models.MatterportOAuthResponse, error) {
	qs := url.Values{
		"grant_type":    []string{"refresh_token"},
		"client_id":     []string{mp.ClientID},
		"client_secret": []string{mp.ClientSecret},
		"refresh_token": []string{mp.RefreshToken},
	}

	req, err := http.NewRequest(http.MethodPost, MATTERPORT_TOKEN_URL, strings.NewReader(qs.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.roundTripper.RoundTrip(req.WithContext(ctx))
	if err != nil {
		return nil, err
	}

	var oauthResp models.MatterportOAuthResponse
	if err = json.NewDecoder(resp.Body).Decode(&oauthResp); err != nil {
		return nil, err
	}

	return &oauthResp, nil
}
