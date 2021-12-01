package twinmaker

import (
	"bytes"
	"encoding/json"
	"strings"
	"text/template"

	"github.com/aws/aws-sdk-go/service/iottwinmaker"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type PolicyStatement struct {
	Effect    string   `json:"Effect"`
	Action    []string `json:"Action"`
	Resource  []string `json:"Resource"`
	Condition string   `json:"Condition,omitempty"`
}

type IAMPolicy struct {
	Version   string            `json:"Version"`
	Statement []PolicyStatement `json:"Statement"`
}

func LoadPolicy(workspace *iottwinmaker.GetWorkspaceOutput) (string, error) {
	data := map[string]interface{}{
		"S3BucketArn":  workspace.S3Location,
		"WorkspaceArn": workspace.Arn,
		"WorkspaceId":  workspace.WorkspaceId,
	}

	policyTemplate := `{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Action": [
					"iottwinmaker:ListWorkspaces"
				],
				"Resource": [
					"*"
				],
				"Effect": "Allow"
			},
			{
				"Action": [
					"iottwinmaker:Get*",
					"iottwinmaker:List*"
				],
				"Resource": [
					"{{.WorkspaceArn}}",
					"{{.WorkspaceArn}}/*"
				],
				"Effect": "Allow"
			},
			{
				"Action": [
					"kinesisvideo:Describe*",
					"kinesisvideo:Get*",
					"kinesisvideo:List*"
				],
				"Resource": "*",
				"Effect": "Allow"
			},
			{
				"Action": [
					"iotsitewise:Describe*",
					"iotsitewise:List*",
					"iotsitewise:Get*"
				],
				"Resource": "*",
				"Effect": "Allow"
			},
			{
				"Action": "iotsitewise:BatchPutAssetPropertyValue",
				"Resource": "*",
				"Effect": "Allow",
				"Condition": {
					"StringEquals": {
						"aws:ResourceTag/{{.WorkspaceId}}": "SiteWatch"
					}
				}
			},
			{
				"Effect": "Allow",
				"Action": ["s3:GetObject"],
				"Resource": [
					"{{.S3BucketArn}}", 
					"{{.S3BucketArn}}/*"
				]
			}
		]
	}`

	buffer := new(bytes.Buffer)
	err := json.Compact(buffer, []byte(policyTemplate))
	if err != nil {
		return "", err
	}
	policyTemplate = buffer.String()

	t := template.Must(template.New("policy").Parse(policyTemplate))
	builder := &strings.Builder{}

	err = t.Execute(builder, data)
	if err != nil {
		return "", err
	}

	return builder.String(), err
}

func checkForUrl(v *iottwinmaker.DataValue, convertor func(v *iottwinmaker.DataValue) interface{}) bool {
	val := convertor(v)
	switch val.(type) {
	case *string:
		val = *v.StringValue
		if strings.Contains(val.(string), "://") {
			return true
		}
	default:
		break
	}
	return false
}

func setUrlDatalink(field *data.Field) {
	field.Config = &data.FieldConfig{
		Links: []data.DataLink{
			{Title: "Link", URL: "${__value.text}", TargetBlank: true},
		},
	}
}
