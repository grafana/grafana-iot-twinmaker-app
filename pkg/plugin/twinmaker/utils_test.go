package twinmaker

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/iottwinmaker"

	"github.com/stretchr/testify/require"
)

func TestLoadPolicy(t *testing.T) {
	workspace := &iottwinmaker.GetWorkspaceOutput{
		S3Location:  aws.String("dummyS3Location"),
		Arn:         aws.String("dummyArn"),
		WorkspaceId: aws.String("dummyWorkspaceId"),
	}

	policy, err := LoadPolicy(workspace)
	require.NoError(t, err)
	require.NotEmpty(t, policy)

	var parsed IAMPolicy
	require.NoError(t, json.Unmarshal([]byte(policy), &parsed))

	// SiteWise assets and KVS streams aren't scoped by WorkspaceArn, so these actions
	// must carry a tag-based condition — otherwise the credentials would grant access
	// to any asset/stream in the account, not just this workspace's.
	scopedActions := map[string]bool{
		"kinesisvideo:GetDataEndpoint":                   false,
		"kinesisvideo:GetHLSStreamingSessionURL":         false,
		"iotsitewise:GetAssetPropertyValue":              false,
		"iotsitewise:GetInterpolatedAssetPropertyValues": false,
		"iotsitewise:BatchPutAssetPropertyValue":         false,
	}

	for _, stmt := range parsed.Statement {
		for _, action := range stmt.Action {
			if _, ok := scopedActions[action]; !ok {
				continue
			}

			require.NotEmptyf(t, stmt.Condition, "statement granting %q must have a resource-scoping condition", action)

			found := false
			for tagOperator, tagConditions := range stmt.Condition {
				if tagOperator == "StringLike" {
					for tagKey, tagValue := range tagConditions {
						if tagKey == "aws:ResourceTag/EdgeConnectorForKVS" && fmt.Sprintf("%v", tagValue) == fmt.Sprintf("*%s*", *workspace.WorkspaceId) {
							found = true
						}
					}
				}
			}
			require.Truef(t, found, "condition for %q must reference the workspace ID so access is scoped to this workspace", action)
			scopedActions[action] = true
		}
	}

	for action, found := range scopedActions {
		require.Truef(t, found, "expected policy to include a scoped statement for %q", action)
	}
}

func TestGetTimeObjectFromStringTime(t *testing.T) {
	t.Run("Convert time string to time object - Seconds precision", func(t *testing.T) {
		timeString := "2017-11-15T11:18:42Z"
		expectedResult := time.Date(2017, 11, 15, 11, 18, 42, 0, time.UTC)
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - Seconds precision with ZoneOffset", func(t *testing.T) {
		timeString := "2017-11-15T11:18:42+08:00"
		expectedResult := time.Date(2017, 11, 15, 11, 18, 42, 0, time.FixedZone("", 8*60*60))
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - MilliSeconds precision", func(t *testing.T) {
		timeString := "2017-11-15T11:18:42.573Z"
		expectedResult := time.Date(2017, 11, 15, 11, 18, 42, 573000000, time.UTC)
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - MicroSeconds precision", func(t *testing.T) {
		timeString := "2017-11-15T11:18:42.573001Z"
		expectedResult := time.Date(2017, 11, 15, 11, 18, 42, 573001000, time.UTC)
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - NanoSeconds precision", func(t *testing.T) {
		timeString := "2017-11-15T11:18:42.573000001Z"
		expectedResult := time.Date(2017, 11, 15, 11, 18, 42, 573000001, time.UTC)
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - NanoSeconds precision with Zone", func(t *testing.T) {
		timeString := "2017-11-15T11:18:42.573000001+08:00"
		expectedResult := time.Date(2017, 11, 15, 11, 18, 42, 573000001, time.FixedZone("", 8*60*60))
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - Seconds truncated", func(t *testing.T) {
		timeString := "2022-04-27T17:50Z"
		expectedResult := time.Date(2022, 04, 27, 17, 50, 0, 0, time.UTC)
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})

	t.Run("Convert time string to time object - Seconds truncated with zoneOffset", func(t *testing.T) {
		timeString := "2022-04-27T17:50+12:00"
		expectedResult := time.Date(2022, 04, 27, 17, 50, 0, 0, time.FixedZone("", 12*60*60))
		actualResult, err := getTimeObjectFromStringTime(&timeString)
		require.NoError(t, err)
		require.Equal(t, expectedResult, *actualResult)
	})
}

func TestGetTimeStringFromTimeObject(t *testing.T) {
	t.Run("Convert time object to ISO 8601 date time string", func(t *testing.T) {
		timeObject := time.Date(2022, 4, 27, 0, 0, 0, 123456789, time.UTC)
		require.Equal(t, "2022-04-27T00:00:00.123456789Z", *getTimeStringFromTimeObject(&timeObject))
	})
}
