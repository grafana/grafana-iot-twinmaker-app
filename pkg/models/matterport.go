package models

type MatterportOAuthSettings struct {
	// ClientID is the Matterport OAuth client ID
	ClientID string `json:"mpClientId"`
	// ClientSecret is the Matterport OAuth client secret
	ClientSecret string `json:"mpClientSecret"`
	// RefreshToken is the Matterport OAuth refresh token
	RefreshToken string `json:"-"`
}

type MatterportOAuthResponse struct {
	// AccessToken is the Matterport OAuth access token
	AccessToken string `json:"access_token"`
	// ExpiresIn is the Matterport OAuth access token expiration time in seconds
	ExpiresIn int `json:"expires_in"`
	// TokenType is the Matterport OAuth access token type
	TokenType string `json:"token_type"`
}
