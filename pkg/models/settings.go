package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/proxy"
)

type TwinMakerDataSourceSetting struct {
	awsds.AWSDatasourceSettings
	ProxyOptions        *proxy.Options
	AssumeRoleARNWriter string `json:"assumeRoleArnWriter"`
	WorkspaceID         string `json:"workspaceId"`
	UID                 string `json:"uid"`
}

func (s *TwinMakerDataSourceSetting) Load(config backend.DataSourceInstanceSettings) error {
	if len(config.JSONData) > 1 {
		if err := json.Unmarshal(config.JSONData, s); err != nil {
			return fmt.Errorf("could not unmarshal DatasourceSettings json: %w", err)
		}
	}

	// data source UID is needed for constructing the streaming channel topic
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

func (s *TwinMakerDataSourceSetting) ToAWSDatasourceSettingsWriter() awsds.AWSDatasourceSettings {
	cfg := s.ToAWSDatasourceSettings()
	cfg.AssumeRoleARN = s.AssumeRoleARNWriter
	return cfg
}
