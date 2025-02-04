package twinmaker

import (
	"context"
	ststypes "github.com/aws/aws-sdk-go-v2/service/sts/types"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/patrickmn/go-cache"
)

type cachingClient struct {
	client       TwinMakerClient
	generalCache cache.Cache
}

func NewCachingClient(client TwinMakerClient, ttl time.Duration) TwinMakerClient {
	return &cachingClient{
		client:       client,
		generalCache: *cache.New(ttl, ttl*2),
	}
}

func (c *cachingClient) getOrExecuteQuery(key string, runner func() (interface{}, error)) (interface{}, error) {
	if key == "" {
		return runner()
	}
	val, ok := c.generalCache.Get(key)
	if ok {
		backend.Logger.Debug("using cached value", "key", key)
		return val, nil
	}
	val, err := runner()
	if err == nil {
		c.generalCache.Set(key, val, 0)
	}
	return val, nil
}

func (c *cachingClient) ListWorkspaces(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListWorkspacesOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("ListWorkspace"),
		func() (interface{}, error) {
			return c.client.ListWorkspaces(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.ListWorkspacesOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) ListScenes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListScenesOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("ListScenes"),
		func() (interface{}, error) {
			return c.client.ListScenes(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.ListScenesOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) ListEntities(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListEntitiesOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("ListEntities"),
		func() (interface{}, error) {
			return c.client.ListEntities(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.ListEntitiesOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) ListComponentTypes(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.ListComponentTypesOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("ListComponentTypes"),
		func() (interface{}, error) {
			return c.client.ListComponentTypes(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.ListComponentTypesOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) GetComponentType(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetComponentTypeOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("GetComponentType"),
		func() (interface{}, error) {
			return c.client.GetComponentType(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.GetComponentTypeOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) GetEntity(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetEntityOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("GetEntity"),
		func() (interface{}, error) {
			return c.client.GetEntity(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.GetEntityOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) GetWorkspace(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetWorkspaceOutput, error) {
	val, err := c.getOrExecuteQuery(
		query.CacheKey("GetWorkspace"),
		func() (interface{}, error) {
			return c.client.GetWorkspace(ctx, query)
		},
	)
	if err == nil {
		a, ok := val.(*iottwinmaker.GetWorkspaceOutput)
		if ok {
			return a, nil
		}
	}
	return nil, err
}

func (c *cachingClient) GetPropertyValue(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueOutput, error) {
	// not cached
	return c.client.GetPropertyValue(ctx, query)
}

func (c *cachingClient) GetPropertyValueHistory(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueHistoryOutput, error) {
	// not cached
	return c.client.GetPropertyValueHistory(ctx, query)
}

func (c *cachingClient) GetSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error) {
	// not cached
	return c.client.GetSessionToken(ctx, duration, workspaceId)
}

func (c *cachingClient) GetWriteSessionToken(ctx context.Context, duration time.Duration, workspaceId string) (*ststypes.Credentials, error) {
	// not cached
	return c.client.GetWriteSessionToken(ctx, duration, workspaceId)
}

func (c *cachingClient) BatchPutPropertyValues(ctx context.Context, request *iottwinmaker.BatchPutPropertyValuesInput) (*iottwinmaker.BatchPutPropertyValuesOutput, error) {
	// not cached
	return c.client.BatchPutPropertyValues(ctx, request)
}
