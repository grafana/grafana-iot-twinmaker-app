package models

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/service/iottwinmaker"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type TwinMakerQueryType = string

const (
	QueryTypeListWorkspace    TwinMakerQueryType = "ListWorkspace" // each datasource will have a default workspace
	QueryTypeListScenes       TwinMakerQueryType = "ListScenes"    // required for scene viewer
	QueryTypeListEntities     TwinMakerQueryType = "ListEntities"  //
	QueryTypeGetEntity        TwinMakerQueryType = "GetEntity"     //
	QueryTypeGetPropertyValue TwinMakerQueryType = "GetPropertyValue"
	QueryTypeComponentHistory TwinMakerQueryType = "ComponentHistory"
	QueryTypeEntityHistory    TwinMakerQueryType = "EntityHistory"
	QueryTypeGetAlarms        TwinMakerQueryType = "GetAlarms"
)

type TwinMakerResultOrder = string

const (
	ResultOrderAsc  TwinMakerResultOrder = "ASCENDING"
	ResultOrderDesc TwinMakerResultOrder = "DESCENDING"
)

type TwinMakerPropertyFilter struct {
	Name  string `json:"name"`
	Value string `json:"value"` // only string for now can switch to interface later
	Op    string `json:"op,omitempty"`
}

type TwinMakerListListEntitiesFilter struct {
	ComponentTypeId string `json:"componentTypeId,omitempty"`
	ExternalId      string `json:"externalId,omitempty"`
	ParentEntityId  string `json:"parentEntityId,omitempty"`
}

func (f *TwinMakerPropertyFilter) ToTwinMakerFilter() *iottwinmaker.PropertyFilter {
	filter := &iottwinmaker.PropertyFilter{
		PropertyName: &f.Name,
		Value:        &iottwinmaker.DataValue{},
	}
	if f.Op != "" {
		filter.SetOperator(f.Op) // ???
	}
	filter.Value.SetStringValue(f.Value)
	return filter
}

// TwinMakerQuery model
type TwinMakerQuery struct {
	WorkspaceId        string                            `json:"workspaceId,omitempty"`
	EntityId           string                            `json:"entityId,omitempty"`
	Properties         []*string                         `json:"properties,omitempty"`
	NextToken          string                            `json:"nextToken,omitempty"`
	ComponentName      string                            `json:"componentName,omitempty"`
	ComponentTypeId    string                            `json:"componentTypeId,omitempty"`
	PropertyFilter     []TwinMakerPropertyFilter         `json:"propertyFilter,omitempty"`
	ListEntitiesFilter []TwinMakerListListEntitiesFilter `json:"listEntitiesFilter,omitempty"`
	Order              TwinMakerResultOrder              `json:"order,omitempty"`
	MaxResults         int                               `json:"maxResults,omitempty"`

	// Direct from the gRPC interfaces
	QueryType TwinMakerQueryType `json:"-"`
	TimeRange backend.TimeRange  `json:"-"`
}

func (q *TwinMakerQuery) CacheKey(pfix string) string {
	if q.NextToken != "" {
		return "" // not cacheable
	}

	key := pfix + "~" + q.WorkspaceId + "/" + q.EntityId + "/" + q.ComponentName + "/" + q.ComponentTypeId

	for _, p := range q.Properties {
		if p != nil {
			key += "#" + *p
		}
	}

	for _, f := range q.PropertyFilter {
		key += "!" + f.Name + f.Op + f.Value
	}

	key += "@" + q.Order

	return key
}

// ReadQuery will read and validate Settings from the DataSourceConfig
func ReadQuery(query backend.DataQuery) (TwinMakerQuery, error) {
	model := TwinMakerQuery{}
	if err := json.Unmarshal(query.JSON, &model); err != nil {
		return model, fmt.Errorf("could not read query: %w", err)
	}

	// From the raw query
	model.TimeRange = query.TimeRange
	model.QueryType = query.QueryType
	return model, nil
}
