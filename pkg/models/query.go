package models

import (
	"encoding/json"
	"fmt"
	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
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

type TwinMakerFilterValue struct {
	BooleanValue *bool    `json:"booleanValue,omitempty"`
	DoubleValue  *float64 `json:"doubleValue,omitempty"`
	IntegerValue *int32   `json:"integerValue,omitempty"`
	LongValue    *int64   `json:"longValue,omitempty"`
	StringValue  *string  `json:"stringValue,omitempty"`
}

type TwinMakerPropertyFilter struct {
	Name  string               `json:"name"`
	Value TwinMakerFilterValue `json:"value"`
	Op    string               `json:"op,omitempty"`
}

func (v *TwinMakerFilterValue) ToTwinMakerDataValue() *iottwinmakertypes.DataValue {
	if v.BooleanValue != nil {
		return &iottwinmakertypes.DataValue{BooleanValue: v.BooleanValue}
	} else if v.DoubleValue != nil {
		return &iottwinmakertypes.DataValue{DoubleValue: v.DoubleValue}
	} else if v.IntegerValue != nil {
		return &iottwinmakertypes.DataValue{IntegerValue: v.IntegerValue}
	} else if v.LongValue != nil {
		return &iottwinmakertypes.DataValue{LongValue: v.LongValue}
	} else if v.StringValue != nil {
		return &iottwinmakertypes.DataValue{StringValue: v.StringValue}
	}
	return &iottwinmakertypes.DataValue{}
}

func (v *TwinMakerFilterValue) DataValueToString() string {
	str := ""
	if v.BooleanValue != nil {
		str = strconv.FormatBool(*v.BooleanValue)
	} else if v.DoubleValue != nil {
		str = strconv.FormatFloat(*v.DoubleValue, 'f', -1, 64)
	} else if v.IntegerValue != nil {
		str = strconv.FormatInt(int64(*v.IntegerValue), 10)
	} else if v.LongValue != nil {
		str = strconv.FormatInt(*v.LongValue, 10)
	} else if v.StringValue != nil {
		str = *v.StringValue
	}
	return str
}

type TwinMakerListEntitiesFilter struct {
	ComponentTypeId string `json:"componentTypeId,omitempty"`
	ExternalId      string `json:"externalId,omitempty"`
	ParentEntityId  string `json:"parentEntityId,omitempty"`
}

func (f *TwinMakerPropertyFilter) ToTwinMakerFilter() iottwinmakertypes.PropertyFilter {
	filter := iottwinmakertypes.PropertyFilter{
		PropertyName: aws.String(f.Name),
		Value:        f.Value.ToTwinMakerDataValue(),
	}
	if f.Op != "" {
		filter.Operator = aws.String(f.Op)
	}
	return filter
}

type TwinMakerOrderBy struct {
	Order        iottwinmakertypes.Order `json:"order,omitempty"`
	PropertyName string                  `json:"propertyName,omitempty"`
}

func (orderBy *TwinMakerOrderBy) ToTwinMakerOrderBy() iottwinmakertypes.OrderBy {
	return iottwinmakertypes.OrderBy{
		Order:        orderBy.Order,
		PropertyName: aws.String(orderBy.PropertyName),
	}
}

type TwinMakerTabularConditions struct {
	OrderBy        []TwinMakerOrderBy        `json:"orderBy,omitempty"`
	PropertyFilter []TwinMakerPropertyFilter `json:"propertyFilter,omitempty"`
}

func (tabularConditions *TwinMakerTabularConditions) ToTwinMakerTabularConditions() *iottwinmakertypes.TabularConditions {
	var orders []iottwinmakertypes.OrderBy
	for _, o := range tabularConditions.OrderBy {
		orders = append(orders, o.ToTwinMakerOrderBy())
	}

	var filters []iottwinmakertypes.PropertyFilter
	for _, pf := range tabularConditions.PropertyFilter {
		filters = append(filters, pf.ToTwinMakerFilter())
	}

	tabularCondition := &iottwinmakertypes.TabularConditions{}
	if len(orders) > 0 {
		tabularCondition.OrderBy = orders
	}
	if len(filters) > 0 {
		tabularCondition.PropertyFilters = filters
	}

	return tabularCondition
}

// TwinMakerQuery model
type TwinMakerQuery struct {
	GrafanaLiveEnabled bool     `json:"grafanaLiveEnabled,omitempty"`
	IsStreaming        bool     `json:"isStreaming,omitempty"`
	WorkspaceId        string   `json:"workspaceId,omitempty"`
	EntityId           string   `json:"entityId,omitempty"`
	Properties         []string `json:"properties,omitempty"`
	// Optional metadata saved with the query.  When this matches properties used in the results, it will
	// replace the display name
	PropertyDisplayNames map[string]string             `json:"propertyDisplayNames,omitempty"`
	NextToken            string                        `json:"nextToken,omitempty"`
	ComponentName        string                        `json:"componentName,omitempty"`
	ComponentTypeId      string                        `json:"componentTypeId,omitempty"`
	PropertyFilter       []TwinMakerPropertyFilter     `json:"filter,omitempty"`
	ListEntitiesFilter   []TwinMakerListEntitiesFilter `json:"listEntitiesFilter,omitempty"`
	Order                iottwinmakertypes.OrderByTime `json:"order,omitempty"`
	MaxResults           int                           `json:"maxResults,omitempty"`

	// Athena Data Connector parameters for iottwinmaker.GetPropertyValue
	TabularConditions TwinMakerTabularConditions `json:"tabularConditions,omitempty"`
	PropertyGroupName string                     `json:"propertyGroupName,omitempty"`

	IntervalStreamingSeconds int           `json:"intervalStreaming,string,omitempty"`
	IntervalStreaming        time.Duration `json:"_"`

	// Direct from the gRPC interfaces
	QueryType TwinMakerQueryType `json:"-"`
	TimeRange backend.TimeRange  `json:"-"`
}

func (q *TwinMakerQuery) CacheKey(prefix string) string {
	if q.NextToken != "" {
		return "" // not cacheable
	}

	key := prefix + "~" + q.WorkspaceId + "/" + q.EntityId + "/" + q.ComponentName + "/" + q.ComponentTypeId

	for _, p := range q.Properties {
		key += "#" + p
	}

	for _, f := range q.PropertyFilter {
		key += "!" + f.Name + f.Op + f.Value.DataValueToString()
	}
	// TODO: does it break the filter?
	for _, ef := range q.ListEntitiesFilter {
		key += "&" + ef.ExternalId
	}

	key += "@" + string(q.Order)

	return key
}

// ReadQuery will read and validate Settings from the DataSourceConfig
func ReadQuery(query backend.DataQuery) (TwinMakerQuery, error) {
	model := TwinMakerQuery{}
	if err := json.Unmarshal(query.JSON, &model); err != nil {
		return model, fmt.Errorf("could not read query: %w", err)
	}

	switch i := model.IntervalStreamingSeconds; {
	case i >= 5:
		model.IntervalStreaming = time.Duration(i) * time.Second
	case i < 5:
		model.IntervalStreaming = 5 * time.Second
	default:
		model.IntervalStreaming = 30 * time.Second
	}

	// From the raw query
	model.TimeRange = query.TimeRange
	model.QueryType = query.QueryType
	return model, nil
}
