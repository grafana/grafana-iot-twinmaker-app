package twinmaker

import (
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/iottwinmaker"
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
}
