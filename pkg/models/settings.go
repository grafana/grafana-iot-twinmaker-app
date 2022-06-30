package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type TwinMakerDataSourceSetting struct {
	awsds.AWSDatasourceSettings
	WorkspaceID string `json:"workspaceId"`
	UID string
}

func (s *TwinMakerDataSourceSetting) Load(config backend.DataSourceInstanceSettings) error {
	if config.JSONData != nil && len(config.JSONData) > 1 {
		if err := json.Unmarshal(config.JSONData, s); err != nil {
			return fmt.Errorf("could not unmarshal DatasourceSettings json: %w", err)
		}
	}

	s.UID = config.UID
	
	if s.Region == "default" || s.Region == "" {
		s.Region = s.DefaultRegion
	}
	if s.Region == "" {
		s.Region = "us-east-1"
	}

	s.AccessKey = config.DecryptedSecureJSONData["accessKey"]
	s.SecretKey = config.DecryptedSecureJSONData["secretKey"]
	return nil
}

func (s *TwinMakerDataSourceSetting) Validate() error {
	// OK
	return nil
}

func (s *TwinMakerDataSourceSetting) ToAWSDatasourceSettings() awsds.AWSDatasourceSettings {
	cfg := awsds.AWSDatasourceSettings{
		Profile:       s.Profile,
		Region:        s.Region,
		AuthType:      s.AuthType,
		AssumeRoleARN: s.AssumeRoleARN,
		ExternalID:    s.ExternalID,
		Endpoint:      s.Endpoint,
		DefaultRegion: s.DefaultRegion,
		AccessKey:     s.AccessKey,
		SecretKey:     s.SecretKey,
		SessionToken:  s.SessionToken,
	}
	return cfg
}
