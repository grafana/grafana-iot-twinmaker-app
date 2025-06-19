package plugin

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	iottwinmakertypes "github.com/aws/aws-sdk-go-v2/service/iottwinmaker/types"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func writeJsonResponse(w http.ResponseWriter, rsp interface{}, err error) {
	w.Header().Add("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = fmt.Fprintf(w, `{"message": "%s"}`, err.Error())
	} else {
		_ = json.NewEncoder(w).Encode(rsp)
	}
}

func (ds *TwinMakerDatasource) HandleGetToken(w http.ResponseWriter, r *http.Request) {
	if ds.settings.AssumeRoleARN == "" {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"message": "Assume Role ARN is missing in datasource configuration"}`))
		return
	}
	token, err := ds.handler.GetSessionToken(r.Context(), time.Second*3600, ds.settings.WorkspaceID)
	writeJsonResponse(w, token, err)
}

func (ds *TwinMakerDatasource) HandleGetEntity(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")
	params := r.URL.Query()
	entityId := params.Get("id")
	if entityId == "" {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"message": "missing id (entity)"}`))
		return
	}

	rsp, err := ds.res.GetEntity(r.Context(), entityId)
	writeJsonResponse(w, rsp, err)
}

func (ds *TwinMakerDatasource) HandleListWorkspaces(w http.ResponseWriter, r *http.Request) {
	rsp, err := ds.res.ListWorkspaces(r.Context())
	writeJsonResponse(w, rsp, err)
}

func (ds *TwinMakerDatasource) HandleListScenes(w http.ResponseWriter, r *http.Request) {
	rsp, err := ds.res.ListScenes(r.Context())
	writeJsonResponse(w, rsp, err)
}

func (ds *TwinMakerDatasource) HandleListOptions(w http.ResponseWriter, r *http.Request) {
	rsp, err := ds.res.ListOptions(r.Context())
	writeJsonResponse(w, rsp, err)
}

func (ds *TwinMakerDatasource) HandleListEntityOptions(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	entityId := params.Get("id")
	if entityId == "" {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"message": "missing id (entity)"}`))
		return
	}

	rsp, err := ds.res.ListEntity(r.Context(), entityId)
	writeJsonResponse(w, rsp, err)
}

func (ds *TwinMakerDatasource) HandleBatchPutPropertyValues(w http.ResponseWriter, r *http.Request) {
	req := struct {
		Entries []*iottwinmakertypes.PropertyValueEntry `json:"entries"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.DefaultLogger.Error("failed to decode request", "error", err)
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"message": "unable to parse request body"}`))
		return
	}
	entries := make([]iottwinmakertypes.PropertyValueEntry, len(req.Entries))
	for i, entry := range req.Entries {
		entries[i] = *entry
	}
	rsp, err := ds.res.BatchPutPropertyValues(r.Context(), entries)
	writeJsonResponse(w, rsp, err)
}
