package twinmaker

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"
	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	ststypes "github.com/aws/aws-sdk-go-v2/service/sts/types"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	httplogger "github.com/grafana/grafana-plugin-sdk-go/experimental/http_logger"
)

// TwinMakerClient calls AWS services and returns the raw results
type TwinMakerClient interface {
	GetSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error)
	GetWriteSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error)
	ListWorkspaces(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListWorkspacesOutput, error)
	GetWorkspace(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetWorkspaceOutput, error)
	ListScenes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListScenesOutput, error)
	ListEntities(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListEntitiesOutput, error)
	ListComponentTypes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListComponentTypesOutput, error)
	GetComponentType(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetComponentTypeOutput, error)
	GetEntity(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetEntityOutput, error)

	BatchPutPropertyValues(ctx context.Context, req *iottwinmaker.BatchPutPropertyValuesInput) (*iottwinmaker.BatchPutPropertyValuesOutput, error)

	// NOTE: only works with non-timeseries data
	GetPropertyValue(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueOutput, error)

	// NOTE: only works with timeseries data
	GetPropertyValueHistory(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueHistoryOutput, error)
}

type twinMakerClient struct {
	tokenRole       string
	tokenRoleWriter string

	twinMakerService func(context.Context) (*iottwinmaker.Client, error)
	writerService    func(context.Context) (*iottwinmaker.Client, error)
	tokenService     func(context.Context) (*sts.Client, error)
}

// NewTwinMakerClient provides a twinMakerClient for the session and associated calls
func NewTwinMakerClient(settings models.TwinMakerDataSourceSetting) (TwinMakerClient, error) {
	httpClient, err := httpclient.New()
	if err != nil {
		return nil, err
	}
	transport, err := httpclient.GetTransport()
	if err != nil {
		return nil, err
	}
	httpClient.Transport = httplogger.NewHTTPLogger("grafana-iot-twinmaker-datasource", transport)
	sessions := awsds.NewSessionCache()
	agent := "grafana-iot-twinmaker-app"

	// Clients should not use a custom endpoint to load session credentials
	noEndpointSettings := settings.AWSDatasourceSettings
	noEndpointSettings.Endpoint = ""

	noEndpointSessionConfig := awsds.GetSessionConfig{
		Settings:      noEndpointSettings,
		HTTPClient:    httpClient,
		UserAgentName: &agent,
	}

	writerSettings := settings.AWSDatasourceSettings
	writerSettings.Endpoint = ""
	writerSettings.AssumeRoleARN = settings.AssumeRoleARNWriter

	writerSessionConfig := awsds.GetSessionConfig{
		Settings:      writerSettings,
		HTTPClient:    httpClient,
		UserAgentName: &agent,
	}

	// STS client can not use scoped down role to generate tokens
	stsSettings := noEndpointSettings
	stsSettings.AssumeRoleARN = ""

	stsSessionConfig := awsds.GetSessionConfig{
		Settings:   stsSettings,
		HTTPClient: httpClient,
	}

	twinMakerService := func(ctx context.Context) (*iottwinmaker.Client, error) {
		creds, err := sessions.CredentialsProviderV2(ctx, noEndpointSessionConfig)
		if err != nil {
			return nil, err
		}
		awsCfg := aws.Config{Credentials: creds, BaseEndpoint: &settings.AWSDatasourceSettings.Endpoint}
		svc := iottwinmaker.NewFromConfig(awsCfg)
		return svc, nil
	}

	writerService := func(ctx context.Context) (*iottwinmaker.Client, error) {
		if writerSessionConfig.Settings.AssumeRoleARN == "" {
			return nil, fmt.Errorf("writer role not configured")
		}
		creds, err := sessions.CredentialsProviderV2(ctx, writerSessionConfig)
		if err != nil {
			return nil, err
		}
		awsCfg := aws.Config{Credentials: creds, BaseEndpoint: &settings.AWSDatasourceSettings.Endpoint}
		svc := iottwinmaker.NewFromConfig(awsCfg)
		return svc, err
	}

	tokenService := func(ctx context.Context) (*sts.Client, error) {
		creds, err := sessions.CredentialsProviderV2(ctx, stsSessionConfig)
		if err != nil {
			return nil, err
		}
		awsCfg := aws.Config{Credentials: creds}
		svc := sts.NewFromConfig(awsCfg)
		return svc, err
	}

	return &twinMakerClient{
		twinMakerService: twinMakerService,
		tokenService:     tokenService,
		writerService:    writerService,
		tokenRole:        settings.AWSDatasourceSettings.AssumeRoleARN,
		tokenRoleWriter:  settings.AssumeRoleARNWriter,
	}, nil
}

func (c *twinMakerClient) ListWorkspaces(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListWorkspacesOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	params := &iottwinmaker.ListWorkspacesInput{
		MaxResults: aws.Int32(200),
		NextToken:  aws.String(query.NextToken),
	}

	workspaces, err := client.ListWorkspaces(ctx, params)
	if err != nil {
		return nil, err
	}

	cWorkspaces := workspaces
	for cWorkspaces.NextToken != nil {
		params.NextToken = cWorkspaces.NextToken

		cWorkspaces, err := client.ListWorkspaces(ctx, params)
		if err != nil {
			return nil, err
		}

		workspaces.WorkspaceSummaries = append(workspaces.WorkspaceSummaries, cWorkspaces.WorkspaceSummaries...)
		workspaces.NextToken = cWorkspaces.NextToken
	}

	return workspaces, nil
}

func (c *twinMakerClient) ListScenes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListScenesOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	params := &iottwinmaker.ListScenesInput{
		MaxResults: aws.Int32(200),
		//Mode:        aws.String("PUBLISHED"),
		NextToken:   aws.String(query.NextToken),
		WorkspaceId: &query.WorkspaceId,
	}

	scenes, err := client.ListScenes(ctx, params)
	if err != nil {
		return nil, err
	}

	cScenes := scenes
	for cScenes.NextToken != nil {
		params.NextToken = cScenes.NextToken

		cScenes, err := client.ListScenes(ctx, params)
		if err != nil {
			return nil, err
		}

		scenes.SceneSummaries = append(scenes.SceneSummaries, cScenes.SceneSummaries...)
		scenes.NextToken = cScenes.NextToken
	}

	return scenes, nil
}

func (c *twinMakerClient) ListEntities(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListEntitiesOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	params := &iottwinmaker.ListEntitiesInput{
		MaxResults:  aws.Int32(200),
		WorkspaceId: &query.WorkspaceId,
	}

	// this will be overridden if a filter is set
	if query.ComponentTypeId != "" {
		params.Filters = make([]iottwinmakertypes.ListEntitiesFilter, 1)
		params.Filters[0] = &iottwinmakertypes.ListEntitiesFilterMemberComponentTypeId{
			Value: query.ComponentTypeId,
		}
	}

	// if a filter is set then just use that instead directly
	if len(query.ListEntitiesFilter) > 0 {
		if len(params.Filters) == 0 {
			params.Filters = make([]iottwinmakertypes.ListEntitiesFilter, 1)
		}
		listEntitiesFilter, err := json.Marshal(query.ListEntitiesFilter)
		if err != nil {
			return nil, err
		}
		err = json.Unmarshal(listEntitiesFilter, &params.Filters)
		if err != nil {
			return nil, err
		}
	}

	entities, err := client.ListEntities(ctx, params)
	if err != nil {
		return nil, err
	}

	cEntities := entities
	for cEntities.NextToken != nil {
		params.NextToken = cEntities.NextToken

		cEntities, err := client.ListEntities(ctx, params)
		if err != nil {
			return nil, err
		}

		entities.EntitySummaries = append(entities.EntitySummaries, cEntities.EntitySummaries...)
		entities.NextToken = cEntities.NextToken
	}

	return entities, nil
}

func (c *twinMakerClient) ListComponentTypes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListComponentTypesOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	params := &iottwinmaker.ListComponentTypesInput{
		MaxResults:  aws.Int32(200),
		NextToken:   aws.String(query.NextToken),
		WorkspaceId: &query.WorkspaceId,
	}

	if query.ComponentTypeId != "" {
		params.Filters = make([]iottwinmakertypes.ListComponentTypesFilter, 1)
		params.Filters[0] = &iottwinmakertypes.ListComponentTypesFilterMemberExtendsFrom{
			Value: query.ComponentTypeId,
		}
	}

	componentTypes, err := client.ListComponentTypes(ctx, params)
	if err != nil {
		return nil, err
	}

	cComponentTypes := componentTypes
	for cComponentTypes.NextToken != nil {
		params.NextToken = cComponentTypes.NextToken

		cComponentTypes, err := client.ListComponentTypes(ctx, params)
		if err != nil {
			return nil, err
		}

		componentTypes.ComponentTypeSummaries = append(componentTypes.ComponentTypeSummaries, cComponentTypes.ComponentTypeSummaries...)
		componentTypes.NextToken = cComponentTypes.NextToken
	}

	return componentTypes, nil
}

func (c *twinMakerClient) GetComponentType(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetComponentTypeOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	if query.ComponentTypeId == "" {
		return nil, fmt.Errorf("missing component type id")
	}

	params := &iottwinmaker.GetComponentTypeInput{
		WorkspaceId:     &query.WorkspaceId,
		ComponentTypeId: &query.ComponentTypeId,
	}

	return client.GetComponentType(ctx, params)
}

func (c *twinMakerClient) GetEntity(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetEntityOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	if query.EntityId == "" {
		return nil, fmt.Errorf("missing entity id")
	}

	params := &iottwinmaker.GetEntityInput{
		EntityId:    &query.EntityId,
		WorkspaceId: &query.WorkspaceId,
	}

	return client.GetEntity(ctx, params)
}

func (c *twinMakerClient) GetWorkspace(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetWorkspaceOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	params := &iottwinmaker.GetWorkspaceInput{
		WorkspaceId: &query.WorkspaceId,
	}

	return client.GetWorkspace(ctx, params)
}

func (c *twinMakerClient) GetPropertyValue(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	if query.EntityId == "" {
		return nil, fmt.Errorf("missing entity id")
	}
	if query.ComponentName == "" {
		return nil, fmt.Errorf("missing component name")
	}
	if len(query.Properties) < 1 {
		return nil, fmt.Errorf("missing property")
	}

	params := &iottwinmaker.GetPropertyValueInput{
		EntityId:           &query.EntityId,
		ComponentName:      &query.ComponentName,
		SelectedProperties: query.Properties,
		WorkspaceId:        &query.WorkspaceId,
		MaxResults:         aws.Int32(200),
	}

	// Parse Athena Data Connector fields
	if query.PropertyGroupName != "" {
		params.PropertyGroupName = &query.PropertyGroupName
	}

	tabularConditions := query.TabularConditions.ToTwinMakerTabularConditions()
	if len(tabularConditions.OrderBy) > 0 || len(tabularConditions.PropertyFilters) > 0 {
		params.TabularConditions = tabularConditions
	}

	propertyValues, err := client.GetPropertyValue(ctx, params)
	if err != nil {
		return nil, err
	}

	cPropertyValues := propertyValues
	for cPropertyValues.NextToken != nil {
		params.NextToken = cPropertyValues.NextToken

		cPropertyValues, err := client.GetPropertyValue(ctx, params)
		if err != nil {
			return nil, err
		}

		propertyValues.TabularPropertyValues = append(propertyValues.TabularPropertyValues, cPropertyValues.TabularPropertyValues...)
		propertyValues.NextToken = cPropertyValues.NextToken
	}

	return propertyValues, nil
}

func (c *twinMakerClient) GetPropertyValueHistory(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueHistoryOutput, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	if query.EntityId == "" && query.ComponentTypeId == "" {
		return nil, fmt.Errorf("missing entity id & component type id - either one required")
	}
	maxR := int32(query.MaxResults)

	params := &iottwinmaker.GetPropertyValueHistoryInput{
		EndTime:            getTimeStringFromTimeObject(&query.TimeRange.To),
		SelectedProperties: query.Properties,
		StartTime:          getTimeStringFromTimeObject(&query.TimeRange.From),
		WorkspaceId:        &query.WorkspaceId,
	}

	if maxR > 0 {
		params.MaxResults = &maxR
	}

	if query.NextToken != "" {
		params.NextToken = &query.NextToken
	}

	if query.Order != "" {
		params.OrderByTime = query.Order
	}

	if c := query.ComponentTypeId; c != "" {
		if len(query.Properties) < 1 {
			return nil, fmt.Errorf("missing property")
		}
		params.ComponentTypeId = &c
	} else {
		if query.ComponentName == "" {
			return nil, fmt.Errorf("missing component name")
		}
		if len(query.Properties) < 1 {
			return nil, fmt.Errorf("missing property")
		}
		params.EntityId = &query.EntityId
		params.ComponentName = &query.ComponentName
	}

	if len(query.PropertyFilter) > 0 {
		var filter []iottwinmakertypes.PropertyFilter
		for _, fq := range query.PropertyFilter {
			if fq.Name != "" && fq.Value.DataValueToString() != "" {
				if fq.Op == "" {
					fq.Op = "=" // matches the placeholder text in the frontend
				}
				filter = append(filter, fq.ToTwinMakerFilter())
			}
		}
		params.PropertyFilters = filter
	}

	return client.GetPropertyValueHistory(ctx, params)
}

func (c *twinMakerClient) GetSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error) {
	client, err := c.twinMakerService(ctx)
	if err != nil {
		return nil, err
	}

	tokenService, err := c.tokenService(ctx)
	if err != nil {
		return nil, err
	}

	// always call AssumeRole with an inline session policy if a role is provided
	if c.tokenRole != "" {
		params := &iottwinmaker.GetWorkspaceInput{
			WorkspaceId: &workspaceId,
		}

		workspace, err := client.GetWorkspace(ctx, params)
		if err != nil {
			return nil, err
		}

		policy, err := LoadPolicy(workspace)
		if err != nil {
			return nil, err
		}

		input := &sts.AssumeRoleInput{
			RoleArn:         &c.tokenRole,
			DurationSeconds: aws.Int32(int32(duration.Seconds())),
			RoleSessionName: aws.String("grafana"),
			Policy:          aws.String(policy),
		}

		out, err := tokenService.AssumeRole(ctx, input)
		if err != nil {
			return nil, err
		}

		return out.Credentials, err
	} else {
		return nil, fmt.Errorf("assume role ARN is missing in datasource configuration")
	}
}

func (c *twinMakerClient) GetWriteSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error) {
	if c.tokenRoleWriter == "" {
		return nil, fmt.Errorf("assume role ARN Write is missing in datasource configuration")
	}

	tokenService, err := c.tokenService(ctx)
	if err != nil {
		return nil, err
	}

	input := &sts.AssumeRoleInput{
		RoleArn:         &c.tokenRoleWriter,
		DurationSeconds: aws.Int32(int32(duration.Seconds())),
		RoleSessionName: aws.String("grafana"),
	}

	out, err := tokenService.AssumeRole(ctx, input)
	if err != nil {
		return nil, err
	}
	return out.Credentials, err
}

func (c *twinMakerClient) BatchPutPropertyValues(ctx context.Context, req *iottwinmaker.BatchPutPropertyValuesInput) (*iottwinmaker.BatchPutPropertyValuesOutput, error) {
	client, err := c.writerService(ctx)
	if err != nil {
		return nil, err
	}

	return client.BatchPutPropertyValues(ctx, req)
}
