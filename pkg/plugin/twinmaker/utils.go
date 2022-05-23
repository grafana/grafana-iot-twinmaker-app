package twinmaker

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
	"time"

	"github.com/aws/aws-sdk-go/service/iottwinmaker"
	"github.com/grafana/grafana-iot-twinmaker-app/pkg/models"
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
				"Effect": "Allow",
				"Action": [
				  "kinesisvideo:GetDataEndpoint",
				  "kinesisvideo:GetHLSStreamingSessionURL"
				],
				"Resource": "*"
			},
			{
				"Effect": "Allow",
				"Action": [
				  "iotsitewise:GetAssetPropertyValue",
				  "iotsitewise:GetInterpolatedAssetPropertyValues"
				],
				"Resource": "*"
			},
			{
				 "Effect": "Allow",
				 "Action": [
				  "iotsitewise:BatchPutAssetPropertyValue"
				],
				"Resource": "*",
				"Condition": {
				  "StringLike": {
					"aws:ResourceTag/EdgeConnectorForKVS": "*{{.WorkspaceId}}*"
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

type PropertyReference struct {
	values                  []*iottwinmaker.PropertyValue
	entityPropertyReference *iottwinmaker.EntityPropertyReference
	entityName              *string
}

func GetEntityPropertyReferenceKey(entityPropertyReference *iottwinmaker.EntityPropertyReference) (s string) {
	externalId := ""
	for _, val := range entityPropertyReference.ExternalIdProperty {
		// Only one externalId in the mapping
		externalId = *val
		break
	}
	// Key is the combination of the unique entityId_componentName_externalId_propertyId
	refKey := ""
	if entityPropertyReference.EntityId != nil {
		refKey = refKey + *entityPropertyReference.EntityId + "_"
	}
	if entityPropertyReference.ComponentName != nil {
		refKey = refKey + *entityPropertyReference.ComponentName + "_"
	}
	refKey = refKey + externalId + "_"
	if entityPropertyReference.PropertyName != nil {
		refKey = refKey + *entityPropertyReference.PropertyName
	}
	return refKey
}

func (s *twinMakerHandler) GetPropertyValueHistoryPaginated(ctx context.Context, query models.TwinMakerQuery) (*iottwinmaker.GetPropertyValueHistoryOutput, error) {
	// original input max results from users
	max := query.MaxResults
	leftOver := 0
	if max > 200 {
		query.MaxResults = 200
		leftOver = max - 200
	}

	propertyValueHistories, err := s.client.GetPropertyValueHistory(ctx, query)
	if err != nil {
		return nil, err
	}

	// Keep mapping of entityPropertyReferences to its index in the result's propertyValues
	entityPropertyReferenceMapping := map[string]int{}
	for i, propertyValue := range propertyValueHistories.PropertyValues {
		refKey := GetEntityPropertyReferenceKey(propertyValue.EntityPropertyReference)
		entityPropertyReferenceMapping[refKey] = i
	}

	cPropertyValuesHistories := propertyValueHistories
	for cPropertyValuesHistories.NextToken != nil && leftOver > 0 {
		query.NextToken = *cPropertyValuesHistories.NextToken
		if leftOver > 200 {
			query.MaxResults = 200
			leftOver = leftOver - 200
		} else {
			query.MaxResults = leftOver
			leftOver = 0
		}
		cPropertyValuesHistories, err := s.client.GetPropertyValueHistory(ctx, query)
		if err != nil {
			return nil, err
		}

		for _, propertyValue := range cPropertyValuesHistories.PropertyValues {
			refKey := GetEntityPropertyReferenceKey(propertyValue.EntityPropertyReference)
			if i, ok := entityPropertyReferenceMapping[refKey]; ok {
				// Append to existing values array to avoid duplicates
				propertyValueHistories.PropertyValues[i].Values = append(propertyValueHistories.PropertyValues[i].Values, propertyValue.Values...)
			} else {
				entityPropertyReferenceMapping[refKey] = len(propertyValueHistories.PropertyValues)
				propertyValueHistories.PropertyValues = append(propertyValueHistories.PropertyValues, propertyValue)
			}
		}

		propertyValueHistories.NextToken = cPropertyValuesHistories.NextToken

	}
	return propertyValueHistories, nil
}

func (s *twinMakerHandler) GetComponentHistoryWithLookup(ctx context.Context, query models.TwinMakerQuery) (p []PropertyReference, n []data.Notice, err error) {
	propertyReferences := []PropertyReference{}
	failures := []data.Notice{}
	componentTypeId := query.ComponentTypeId

	// Step 1: Call GetPropertyValueHistory and get the externalId from the response
	result, err := s.GetPropertyValueHistoryPaginated(ctx, query)
	if err != nil {
		return propertyReferences, failures, err
	}

	if len(result.PropertyValues) > 0 {
		// Loop through all propertyValues if there are multiple components of the same type on the entity
		for _, propertyValue := range result.PropertyValues {
			externalId := ""
			for _, val := range propertyValue.EntityPropertyReference.ExternalIdProperty {
				// Only one externalId per component
				externalId = *val
				break
			}

			// Step 2: Call ListEntities with a filter for the externalId
			query.EntityId = ""
			query.Properties = nil
			query.ComponentTypeId = ""

			query.ListEntitiesFilter = []models.TwinMakerListEntitiesFilter{
				{
					ExternalId: externalId,
				},
			}
			le, err := s.client.ListEntities(ctx, query)

			if err != nil {
				notice := data.Notice{
					Severity: data.NoticeSeverityWarning,
					Text:     err.Error(),
				}
				failures = append(failures, notice)
			}
			if le == nil {
				return propertyReferences, failures, fmt.Errorf("error loading entities for GetAlarms query")
			}

			// Step 3: Call GetEntity to get the componentName of the externalId
			if len(le.EntitySummaries) > 0 {
				entityId := le.EntitySummaries[0].EntityId
				entityName := le.EntitySummaries[0].EntityName
				query.EntityId = *entityId
				e, err := s.client.GetEntity(ctx, query)
				if err != nil {
					notice := data.Notice{
						Severity: data.NoticeSeverityWarning,
						Text:     err.Error(),
					}
					failures = append(failures, notice)
				} else if e == nil {
					return propertyReferences, failures, fmt.Errorf("error loading entity for GetAlarms query")
				}

				componentName := ""
				for _, component := range e.Components {
					// If the componentTypeId and externalId match then we found the component
					if *component.ComponentTypeId == componentTypeId {
						for _, property := range component.Properties {
							if *property.Definition.IsExternalId {
								if *property.Value.StringValue == externalId {
									componentName = *component.ComponentName
									break
								}
							}
						}
						break
					}
				}

				pr := PropertyReference{
					values: propertyValue.Values,
					entityPropertyReference: &iottwinmaker.EntityPropertyReference{
						EntityId:           entityId,
						ComponentName:      &componentName,
						ExternalIdProperty: propertyValue.EntityPropertyReference.ExternalIdProperty,
						PropertyName:       propertyValue.EntityPropertyReference.PropertyName,
					},
					entityName: entityName,
				}
				propertyReferences = append(propertyReferences, pr)
			}
		}
	}

	return propertyReferences, failures, nil
}

func getTimeObjectFromStringTime(timeString *string) (*time.Time, error) {
	if timeString == nil {
		return nil, fmt.Errorf("no time string")
	}
	stringValue := *timeString
	// Handle missing seconds value in the time string
	index := 16 // Position for seconds
	if string(stringValue[index]) != ":" {
		stringValue = stringValue[:index] + ":00" + stringValue[index:]
	}
	// Convert to time object
	t, err := time.Parse(time.RFC3339, stringValue)
	if err != nil {
		fmt.Println(err.Error())
	}
	return &t, err
}

func getTimeStringFromTimeObject(timeObject *time.Time) *string {
	timeString := timeObject.Format(time.RFC3339)
	return &timeString
}
