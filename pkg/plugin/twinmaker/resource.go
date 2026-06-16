package twinmaker

import (
	"context"
	"fmt"
	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"
	"slices"

	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
)

// Resource requests
type TwinMakerResources interface {
	// Original model
	GetEntity(ctx context.Context, id string) (*iottwinmaker.GetEntityOutput, error)

	BatchPutPropertyValues(context.Context, []iottwinmakertypes.PropertyValueEntry) (*iottwinmaker.BatchPutPropertyValuesOutput, error)

	// Selectable values
	ListWorkspaces(ctx context.Context) ([]models.SelectableString, error)
	ListScenes(ctx context.Context) ([]models.SelectableString, error)
	ListOptions(ctx context.Context) (models.OptionsInfo, error)
	ListEntity(ctx context.Context, id string) ([]models.SelectableProps, error)
}

type twinMakerResource struct {
	workspaceId string
	client      TwinMakerClient
}

func NewTwinMakerResource(client TwinMakerClient, workspaceId string) TwinMakerResources {
	return &twinMakerResource{
		client:      client,
		workspaceId: workspaceId,
	}
}

func (r *twinMakerResource) GetEntity(ctx context.Context, entityId string) (*iottwinmaker.GetEntityOutput, error) {
	if entityId == "" {
		return nil, fmt.Errorf("missing entityid")
	}

	query := models.TwinMakerQuery{
		WorkspaceId: r.workspaceId,
		EntityId:    entityId,
	}

	return r.client.GetEntity(ctx, query)
}

func (r *twinMakerResource) ListWorkspaces(ctx context.Context) ([]models.SelectableString, error) {
	query := models.TwinMakerQuery{
		WorkspaceId: r.workspaceId,
	}
	results := make([]models.SelectableString, 0, 20)
	for {
		rsp, err := r.client.ListWorkspaces(ctx, query)
		if err != nil {
			return results, err
		}
		for _, w := range rsp.WorkspaceSummaries {
			info := models.SelectableString{}
			if w.WorkspaceId != nil {
				info.Label = *w.WorkspaceId
				info.Value = *w.WorkspaceId
			}
			if w.Description != nil {
				info.Description = *w.Description
			}
			results = append(results, info)
		}

		if rsp.NextToken != nil {
			query.NextToken = *rsp.NextToken
		} else {
			return results, nil
		}
	}
}

func (r *twinMakerResource) ListScenes(ctx context.Context) ([]models.SelectableString, error) {
	query := models.TwinMakerQuery{
		WorkspaceId: r.workspaceId,
	}
	results := make([]models.SelectableString, 0, 100)

	for {
		rsp, err := r.client.ListScenes(ctx, query)
		if err != nil {
			return results, err
		}
		for _, w := range rsp.SceneSummaries {
			info := models.SelectableString{}
			if w.SceneId != nil {
				info.Label = *w.SceneId
				info.Value = *w.SceneId
			}
			if w.Description != nil {
				info.Description = *w.Description
			}
			results = append(results, info)
		}

		if rsp.NextToken != nil {
			query.NextToken = *rsp.NextToken
		} else {
			return results, nil
		}
	}
}

func (r *twinMakerResource) ListOptions(ctx context.Context) (models.OptionsInfo, error) {
	query := models.TwinMakerQuery{
		WorkspaceId: r.workspaceId,
	}

	results := models.OptionsInfo{
		Entities:   make([]models.SelectableString, 0, 100),
		Components: make([]models.SelectableProps, 0, 100),
	}

	// Loop through all entities
	for {
		rsp, err := r.client.ListEntities(ctx, query)
		if err != nil {
			return results, err
		}

		for _, w := range rsp.EntitySummaries {
			info := models.SelectableString{}
			if w.EntityId != nil {
				info.Label = *w.EntityId
				info.Value = *w.EntityId
			}
			if w.EntityName != nil {
				info.Label = *w.EntityName
				info.Description = *w.EntityId
			}
			if w.Description != nil && *w.Description != "" {
				info.Description = *w.Description
			}
			results.Entities = append(results.Entities, info)
		}

		if rsp.NextToken != nil {
			query.NextToken = *rsp.NextToken
		} else {
			break
		}
	}

	query.NextToken = ""
	props := make(map[string]models.SelectableString)

	for {
		rsp, err := r.client.ListComponentTypes(ctx, query)
		if err != nil {
			return results, err
		}

		for _, w := range rsp.ComponentTypeSummaries {
			if w.ComponentTypeId == nil {
				continue
			}

			typeId := *w.ComponentTypeId
			label := typeId
			if w.ComponentTypeName != nil {
				label = *w.ComponentTypeName
			}

			info := models.SelectableProps{}
			info.Label = label
			info.Value = typeId
			info.Description = typeId

			// nested query!
			query.ComponentTypeId = typeId
			v, err := r.client.GetComponentType(ctx, query)
			if err != nil {
				return results, err
			}
			info.IsAbstract = *v.IsAbstract

			ts, p :=
				toPropertiesSelectableValues(v.PropertyDefinitions, props)
			info.TimeSeries = ts
			info.Props = p
			for _, ex := range v.ExtendsFrom {
				if ex == "com.amazon.iottwinmaker.alarm.basic" {
					info.IsAlarm = true
					break
				}
			}

			results.Components = append(results.Components, info)
		}

		if rsp.NextToken != nil {
			query.NextToken = *rsp.NextToken
		} else {
			break
		}
	}

	// List all distinct properties
	results.Properties = make([]models.SelectableString, 0, len(props))
	for _, v := range props {
		results.Properties = append(results.Properties, v)
	}

	return results, nil
}

func (r *twinMakerResource) ListEntity(ctx context.Context, entityId string) ([]models.SelectableProps, error) {
	query := models.TwinMakerQuery{
		WorkspaceId: r.workspaceId,
		EntityId:    entityId,
	}

	rsp, err := r.client.GetEntity(ctx, query)

	results := make([]models.SelectableProps, 0)
	for _, comp := range rsp.Components {
		info := models.SelectableProps{}
		info.Value = *comp.ComponentName
		info.Label = *comp.ComponentName
		if comp.Description != nil {
			info.Description = *comp.Description
		}

		// Match format from components
		def := make(map[string]iottwinmakertypes.PropertyDefinitionResponse)
		for k, v := range comp.Properties {
			if v.Definition != nil {
				def[k] = *v.Definition
			}
		}
		ts, p := toPropertiesSelectableValues(def, nil)
		info.TimeSeries = ts
		info.Props = p

		if comp.PropertyGroups != nil {
			// List PropertyGroups with each associated property name list
			propGroups, propNames := toPropertyGroupsSelectableValues(comp.PropertyGroups)

			for i, propList := range propNames {
				// Filter properties that are in PropertyGroups
				propGroupProps := make([]models.SelectableString, 0)
				for _, def := range p {
					if slices.Contains(propList, def.Value) {
						propGroupProps = append(propGroupProps, def)
					}
				}
				propGroups[i].Props = propGroupProps
			}
			info.PropGroups = propGroups
		}

		results = append(results, info)
	}

	return results, err
}

func (r *twinMakerResource) BatchPutPropertyValues(ctx context.Context, entries []iottwinmakertypes.PropertyValueEntry) (*iottwinmaker.BatchPutPropertyValuesOutput, error) {
	input := &iottwinmaker.BatchPutPropertyValuesInput{
		WorkspaceId: &r.workspaceId,
		Entries:     entries,
	}
	return r.client.BatchPutPropertyValues(ctx, input)
}

func toPropertiesSelectableValues(def map[string]iottwinmakertypes.PropertyDefinitionResponse, reg map[string]models.SelectableString) (timeseries []models.SelectableString, props []models.SelectableString) {
	for key, element := range def {
		if element.DataType == nil {
			continue
		}

		label := key
		if element.DisplayName != nil {
			label = *element.DisplayName
		}

		p := models.SelectableString{
			Value:       key,
			Label:       label,
			Description: fmt.Sprintf("%s (%s)", key, element.DataType.Type),
		}
		if *element.IsTimeSeries {
			timeseries = append(timeseries, p)
		} else {
			props = append(props, p)
		}
		if reg != nil {
			reg[key] = p
		}
	}
	return
}

func toPropertyGroupsSelectableValues(def map[string]iottwinmakertypes.ComponentPropertyGroupResponse) (propGroups []models.SelectablePropGroup, propNames [][]string) {
	for key, element := range def {
		p := models.SelectablePropGroup{
			SelectableString: models.SelectableString{
				Value: key,
				Label: fmt.Sprintf("%s (%s)", key, element.GroupType),
			},
		}
		propNames = append(propNames, [][]string{element.PropertyNames}...)
		propGroups = append(propGroups, p)
	}
	return
}
