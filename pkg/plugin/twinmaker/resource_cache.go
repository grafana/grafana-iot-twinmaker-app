package twinmaker

import (
	"context"
	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"

	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
	"github.com/patrickmn/go-cache"
)

type cachingResource struct {
	res   TwinMakerResources
	stash *cache.Cache
}

func NewCachingResource(res TwinMakerResources, ttl time.Duration) TwinMakerResources {
	return &cachingResource{
		res:   res,
		stash: cache.New(ttl, ttl*2),
	}
}

func (s *cachingResource) GetEntity(ctx context.Context, id string) (*iottwinmaker.GetEntityOutput, error) {
	key := "GetEntity/" + id
	val, ok := s.stash.Get(key)
	if ok {
		v, ok := val.(*iottwinmaker.GetEntityOutput)
		if ok {
			return v, nil
		}
	}

	v, err := s.res.GetEntity(ctx, id)
	if err != nil {
		s.stash.Set(key, v, 0)
	}
	return v, err
}

func (s *cachingResource) ListWorkspaces(ctx context.Context) ([]models.SelectableString, error) {
	key := "ListWorkspaces/"
	val, ok := s.stash.Get(key)
	if ok {
		v, ok := val.([]models.SelectableString)
		if ok {
			return v, nil
		}
	}

	v, err := s.res.ListWorkspaces(ctx)
	if err != nil {
		s.stash.Set(key, v, 0)
	}
	return v, err
}

func (s *cachingResource) ListScenes(ctx context.Context) ([]models.SelectableString, error) {
	key := "ListScenes/"
	val, ok := s.stash.Get(key)
	if ok {
		v, ok := val.([]models.SelectableString)
		if ok {
			return v, nil
		}
	}

	v, err := s.res.ListScenes(ctx)
	if err != nil {
		s.stash.Set(key, v, 0)
	}
	return v, err
}

func (s *cachingResource) ListOptions(ctx context.Context) (models.OptionsInfo, error) {
	key := "ListOptions/"
	val, ok := s.stash.Get(key)
	if ok {
		v, ok := val.(models.OptionsInfo)
		if ok {
			return v, nil
		}
	}

	v, err := s.res.ListOptions(ctx)
	if err != nil {
		s.stash.Set(key, v, 0)
	}
	return v, err
}

func (s *cachingResource) ListEntity(ctx context.Context, id string) ([]models.SelectableProps, error) {
	key := "ListEntity/" + id
	val, ok := s.stash.Get(key)
	if ok {
		v, ok := val.([]models.SelectableProps)
		if ok {
			return v, nil
		}
	}

	v, err := s.res.ListEntity(ctx, id)
	if err != nil {
		s.stash.Set(key, v, 0)
	}
	return v, err
}

func (s *cachingResource) BatchPutPropertyValues(ctx context.Context, entries []iottwinmakertypes.PropertyValueEntry) (*iottwinmaker.BatchPutPropertyValuesOutput, error) {
	return s.res.BatchPutPropertyValues(ctx, entries)
}
