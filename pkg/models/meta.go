package models

import "github.com/grafana/grafana-plugin-sdk-go/backend"

// TwinMakerCustomMeta is the standard metadata
type TwinMakerCustomMeta struct {
	NextToken string `json:"nextToken,omitempty"`
}

// LoadFromResponse returns the first non-empty TwinMakerCustomMeta from a DataResponse.
func LoadMetaFromResponse(res backend.DataResponse) *TwinMakerCustomMeta {
	for _, frame := range res.Frames {
		if frame.Meta == nil || frame.Meta.Custom == nil {
			continue
		}
		meta, ok := frame.Meta.Custom.(TwinMakerCustomMeta)
		// skip frame if NextToken is not set
		if ok && meta.NextToken != "" {
			return &meta
		}
	}
	return nil
}
