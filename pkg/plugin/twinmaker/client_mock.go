package twinmaker

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"
	ststypes "github.com/aws/aws-sdk-go-v2/service/sts/types"

	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
)

type twinMakerMockClient struct {
	path string
}

// NewTwinMakerMockClient provides a mock twinMakerMockClient for the session and associated calls
func NewTwinMakerMockClient(path string) (*twinMakerMockClient, error) {
	return &twinMakerMockClient{
		path: path,
	}, nil
}

func (c *twinMakerMockClient) loadSavedResponse(r interface{}) (interface{}, error) {
	bs, err := os.ReadFile("./testdata/" + c.path + ".json")
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(bs, r)
	return r, err
}

func (c *twinMakerMockClient) GetWorkspace(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetWorkspaceOutput, error) {
	r := &iottwinmaker.GetWorkspaceOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) ListWorkspaces(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListWorkspacesOutput, error) {
	r := &iottwinmaker.ListWorkspacesOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) ListScenes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListScenesOutput, error) {
	r := &iottwinmaker.ListScenesOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) ListEntities(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListEntitiesOutput, error) {
	r := &iottwinmaker.ListEntitiesOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) ListComponentTypes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListComponentTypesOutput, error) {
	r := &iottwinmaker.ListComponentTypesOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) GetComponentType(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetComponentTypeOutput, error) {
	r := &iottwinmaker.GetComponentTypeOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) GetEntity(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetEntityOutput, error) {
	r := &iottwinmaker.GetEntityOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) GetPropertyValue(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueOutput, error) {
	r := &iottwinmaker.GetPropertyValueOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) GetPropertyValueHistory(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueHistoryOutput, error) {
	r := &iottwinmaker.GetPropertyValueHistoryOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) GetSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error) {
	r := &ststypes.Credentials{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) GetWriteSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error) {
	r := &ststypes.Credentials{}
	_, err := c.loadSavedResponse(r)
	return r, err
}

func (c *twinMakerMockClient) BatchPutPropertyValues(ctx context.Context, request *iottwinmaker.BatchPutPropertyValuesInput) (*iottwinmaker.BatchPutPropertyValuesOutput, error) {
	r := &iottwinmaker.BatchPutPropertyValuesOutput{}
	_, err := c.loadSavedResponse(r)
	return r, err
}
