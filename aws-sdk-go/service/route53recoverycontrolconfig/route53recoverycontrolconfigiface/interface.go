// Code generated by private/model/cli/gen-api/main.go. DO NOT EDIT.

// Package route53recoverycontrolconfigiface provides an interface to enable mocking the AWS Route53 Recovery Control Config service client
// for testing your code.
//
// It is important to note that this interface will have breaking changes
// when the service model is updated and adds new API operations, paginators,
// and waiters.
package route53recoverycontrolconfigiface

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/route53recoverycontrolconfig"
)

// Route53RecoveryControlConfigAPI provides an interface to enable mocking the
// route53recoverycontrolconfig.Route53RecoveryControlConfig service client's API operation,
// paginators, and waiters. This make unit testing your code that calls out
// to the SDK's service client's calls easier.
//
// The best way to use this interface is so the SDK's service client's calls
// can be stubbed out for unit testing your code with the SDK without needing
// to inject custom request handlers into the SDK's request pipeline.
//
//	// myFunc uses an SDK service client to make a request to
//	// AWS Route53 Recovery Control Config.
//	func myFunc(svc route53recoverycontrolconfigiface.Route53RecoveryControlConfigAPI) bool {
//	    // Make svc.CreateCluster request
//	}
//
//	func main() {
//	    sess := session.New()
//	    svc := route53recoverycontrolconfig.New(sess)
//
//	    myFunc(svc)
//	}
//
// In your _test.go file:
//
//	// Define a mock struct to be used in your unit tests of myFunc.
//	type mockRoute53RecoveryControlConfigClient struct {
//	    route53recoverycontrolconfigiface.Route53RecoveryControlConfigAPI
//	}
//	func (m *mockRoute53RecoveryControlConfigClient) CreateCluster(input *route53recoverycontrolconfig.CreateClusterInput) (*route53recoverycontrolconfig.CreateClusterOutput, error) {
//	    // mock response/functionality
//	}
//
//	func TestMyFunc(t *testing.T) {
//	    // Setup Test
//	    mockSvc := &mockRoute53RecoveryControlConfigClient{}
//
//	    myfunc(mockSvc)
//
//	    // Verify myFunc's functionality
//	}
//
// It is important to note that this interface will have breaking changes
// when the service model is updated and adds new API operations, paginators,
// and waiters. Its suggested to use the pattern above for testing, or using
// tooling to generate mocks to satisfy the interfaces.
type Route53RecoveryControlConfigAPI interface {
	CreateCluster(*route53recoverycontrolconfig.CreateClusterInput) (*route53recoverycontrolconfig.CreateClusterOutput, error)
	CreateClusterWithContext(aws.Context, *route53recoverycontrolconfig.CreateClusterInput, ...request.Option) (*route53recoverycontrolconfig.CreateClusterOutput, error)
	CreateClusterRequest(*route53recoverycontrolconfig.CreateClusterInput) (*request.Request, *route53recoverycontrolconfig.CreateClusterOutput)

	CreateControlPanel(*route53recoverycontrolconfig.CreateControlPanelInput) (*route53recoverycontrolconfig.CreateControlPanelOutput, error)
	CreateControlPanelWithContext(aws.Context, *route53recoverycontrolconfig.CreateControlPanelInput, ...request.Option) (*route53recoverycontrolconfig.CreateControlPanelOutput, error)
	CreateControlPanelRequest(*route53recoverycontrolconfig.CreateControlPanelInput) (*request.Request, *route53recoverycontrolconfig.CreateControlPanelOutput)

	CreateRoutingControl(*route53recoverycontrolconfig.CreateRoutingControlInput) (*route53recoverycontrolconfig.CreateRoutingControlOutput, error)
	CreateRoutingControlWithContext(aws.Context, *route53recoverycontrolconfig.CreateRoutingControlInput, ...request.Option) (*route53recoverycontrolconfig.CreateRoutingControlOutput, error)
	CreateRoutingControlRequest(*route53recoverycontrolconfig.CreateRoutingControlInput) (*request.Request, *route53recoverycontrolconfig.CreateRoutingControlOutput)

	CreateSafetyRule(*route53recoverycontrolconfig.CreateSafetyRuleInput) (*route53recoverycontrolconfig.CreateSafetyRuleOutput, error)
	CreateSafetyRuleWithContext(aws.Context, *route53recoverycontrolconfig.CreateSafetyRuleInput, ...request.Option) (*route53recoverycontrolconfig.CreateSafetyRuleOutput, error)
	CreateSafetyRuleRequest(*route53recoverycontrolconfig.CreateSafetyRuleInput) (*request.Request, *route53recoverycontrolconfig.CreateSafetyRuleOutput)

	DeleteCluster(*route53recoverycontrolconfig.DeleteClusterInput) (*route53recoverycontrolconfig.DeleteClusterOutput, error)
	DeleteClusterWithContext(aws.Context, *route53recoverycontrolconfig.DeleteClusterInput, ...request.Option) (*route53recoverycontrolconfig.DeleteClusterOutput, error)
	DeleteClusterRequest(*route53recoverycontrolconfig.DeleteClusterInput) (*request.Request, *route53recoverycontrolconfig.DeleteClusterOutput)

	DeleteControlPanel(*route53recoverycontrolconfig.DeleteControlPanelInput) (*route53recoverycontrolconfig.DeleteControlPanelOutput, error)
	DeleteControlPanelWithContext(aws.Context, *route53recoverycontrolconfig.DeleteControlPanelInput, ...request.Option) (*route53recoverycontrolconfig.DeleteControlPanelOutput, error)
	DeleteControlPanelRequest(*route53recoverycontrolconfig.DeleteControlPanelInput) (*request.Request, *route53recoverycontrolconfig.DeleteControlPanelOutput)

	DeleteRoutingControl(*route53recoverycontrolconfig.DeleteRoutingControlInput) (*route53recoverycontrolconfig.DeleteRoutingControlOutput, error)
	DeleteRoutingControlWithContext(aws.Context, *route53recoverycontrolconfig.DeleteRoutingControlInput, ...request.Option) (*route53recoverycontrolconfig.DeleteRoutingControlOutput, error)
	DeleteRoutingControlRequest(*route53recoverycontrolconfig.DeleteRoutingControlInput) (*request.Request, *route53recoverycontrolconfig.DeleteRoutingControlOutput)

	DeleteSafetyRule(*route53recoverycontrolconfig.DeleteSafetyRuleInput) (*route53recoverycontrolconfig.DeleteSafetyRuleOutput, error)
	DeleteSafetyRuleWithContext(aws.Context, *route53recoverycontrolconfig.DeleteSafetyRuleInput, ...request.Option) (*route53recoverycontrolconfig.DeleteSafetyRuleOutput, error)
	DeleteSafetyRuleRequest(*route53recoverycontrolconfig.DeleteSafetyRuleInput) (*request.Request, *route53recoverycontrolconfig.DeleteSafetyRuleOutput)

	DescribeCluster(*route53recoverycontrolconfig.DescribeClusterInput) (*route53recoverycontrolconfig.DescribeClusterOutput, error)
	DescribeClusterWithContext(aws.Context, *route53recoverycontrolconfig.DescribeClusterInput, ...request.Option) (*route53recoverycontrolconfig.DescribeClusterOutput, error)
	DescribeClusterRequest(*route53recoverycontrolconfig.DescribeClusterInput) (*request.Request, *route53recoverycontrolconfig.DescribeClusterOutput)

	DescribeControlPanel(*route53recoverycontrolconfig.DescribeControlPanelInput) (*route53recoverycontrolconfig.DescribeControlPanelOutput, error)
	DescribeControlPanelWithContext(aws.Context, *route53recoverycontrolconfig.DescribeControlPanelInput, ...request.Option) (*route53recoverycontrolconfig.DescribeControlPanelOutput, error)
	DescribeControlPanelRequest(*route53recoverycontrolconfig.DescribeControlPanelInput) (*request.Request, *route53recoverycontrolconfig.DescribeControlPanelOutput)

	DescribeRoutingControl(*route53recoverycontrolconfig.DescribeRoutingControlInput) (*route53recoverycontrolconfig.DescribeRoutingControlOutput, error)
	DescribeRoutingControlWithContext(aws.Context, *route53recoverycontrolconfig.DescribeRoutingControlInput, ...request.Option) (*route53recoverycontrolconfig.DescribeRoutingControlOutput, error)
	DescribeRoutingControlRequest(*route53recoverycontrolconfig.DescribeRoutingControlInput) (*request.Request, *route53recoverycontrolconfig.DescribeRoutingControlOutput)

	DescribeSafetyRule(*route53recoverycontrolconfig.DescribeSafetyRuleInput) (*route53recoverycontrolconfig.DescribeSafetyRuleOutput, error)
	DescribeSafetyRuleWithContext(aws.Context, *route53recoverycontrolconfig.DescribeSafetyRuleInput, ...request.Option) (*route53recoverycontrolconfig.DescribeSafetyRuleOutput, error)
	DescribeSafetyRuleRequest(*route53recoverycontrolconfig.DescribeSafetyRuleInput) (*request.Request, *route53recoverycontrolconfig.DescribeSafetyRuleOutput)

	ListAssociatedRoute53HealthChecks(*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksInput) (*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksOutput, error)
	ListAssociatedRoute53HealthChecksWithContext(aws.Context, *route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksInput, ...request.Option) (*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksOutput, error)
	ListAssociatedRoute53HealthChecksRequest(*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksInput) (*request.Request, *route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksOutput)

	ListAssociatedRoute53HealthChecksPages(*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksInput, func(*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksOutput, bool) bool) error
	ListAssociatedRoute53HealthChecksPagesWithContext(aws.Context, *route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksInput, func(*route53recoverycontrolconfig.ListAssociatedRoute53HealthChecksOutput, bool) bool, ...request.Option) error

	ListClusters(*route53recoverycontrolconfig.ListClustersInput) (*route53recoverycontrolconfig.ListClustersOutput, error)
	ListClustersWithContext(aws.Context, *route53recoverycontrolconfig.ListClustersInput, ...request.Option) (*route53recoverycontrolconfig.ListClustersOutput, error)
	ListClustersRequest(*route53recoverycontrolconfig.ListClustersInput) (*request.Request, *route53recoverycontrolconfig.ListClustersOutput)

	ListClustersPages(*route53recoverycontrolconfig.ListClustersInput, func(*route53recoverycontrolconfig.ListClustersOutput, bool) bool) error
	ListClustersPagesWithContext(aws.Context, *route53recoverycontrolconfig.ListClustersInput, func(*route53recoverycontrolconfig.ListClustersOutput, bool) bool, ...request.Option) error

	ListControlPanels(*route53recoverycontrolconfig.ListControlPanelsInput) (*route53recoverycontrolconfig.ListControlPanelsOutput, error)
	ListControlPanelsWithContext(aws.Context, *route53recoverycontrolconfig.ListControlPanelsInput, ...request.Option) (*route53recoverycontrolconfig.ListControlPanelsOutput, error)
	ListControlPanelsRequest(*route53recoverycontrolconfig.ListControlPanelsInput) (*request.Request, *route53recoverycontrolconfig.ListControlPanelsOutput)

	ListControlPanelsPages(*route53recoverycontrolconfig.ListControlPanelsInput, func(*route53recoverycontrolconfig.ListControlPanelsOutput, bool) bool) error
	ListControlPanelsPagesWithContext(aws.Context, *route53recoverycontrolconfig.ListControlPanelsInput, func(*route53recoverycontrolconfig.ListControlPanelsOutput, bool) bool, ...request.Option) error

	ListRoutingControls(*route53recoverycontrolconfig.ListRoutingControlsInput) (*route53recoverycontrolconfig.ListRoutingControlsOutput, error)
	ListRoutingControlsWithContext(aws.Context, *route53recoverycontrolconfig.ListRoutingControlsInput, ...request.Option) (*route53recoverycontrolconfig.ListRoutingControlsOutput, error)
	ListRoutingControlsRequest(*route53recoverycontrolconfig.ListRoutingControlsInput) (*request.Request, *route53recoverycontrolconfig.ListRoutingControlsOutput)

	ListRoutingControlsPages(*route53recoverycontrolconfig.ListRoutingControlsInput, func(*route53recoverycontrolconfig.ListRoutingControlsOutput, bool) bool) error
	ListRoutingControlsPagesWithContext(aws.Context, *route53recoverycontrolconfig.ListRoutingControlsInput, func(*route53recoverycontrolconfig.ListRoutingControlsOutput, bool) bool, ...request.Option) error

	ListSafetyRules(*route53recoverycontrolconfig.ListSafetyRulesInput) (*route53recoverycontrolconfig.ListSafetyRulesOutput, error)
	ListSafetyRulesWithContext(aws.Context, *route53recoverycontrolconfig.ListSafetyRulesInput, ...request.Option) (*route53recoverycontrolconfig.ListSafetyRulesOutput, error)
	ListSafetyRulesRequest(*route53recoverycontrolconfig.ListSafetyRulesInput) (*request.Request, *route53recoverycontrolconfig.ListSafetyRulesOutput)

	ListSafetyRulesPages(*route53recoverycontrolconfig.ListSafetyRulesInput, func(*route53recoverycontrolconfig.ListSafetyRulesOutput, bool) bool) error
	ListSafetyRulesPagesWithContext(aws.Context, *route53recoverycontrolconfig.ListSafetyRulesInput, func(*route53recoverycontrolconfig.ListSafetyRulesOutput, bool) bool, ...request.Option) error

	ListTagsForResource(*route53recoverycontrolconfig.ListTagsForResourceInput) (*route53recoverycontrolconfig.ListTagsForResourceOutput, error)
	ListTagsForResourceWithContext(aws.Context, *route53recoverycontrolconfig.ListTagsForResourceInput, ...request.Option) (*route53recoverycontrolconfig.ListTagsForResourceOutput, error)
	ListTagsForResourceRequest(*route53recoverycontrolconfig.ListTagsForResourceInput) (*request.Request, *route53recoverycontrolconfig.ListTagsForResourceOutput)

	TagResource(*route53recoverycontrolconfig.TagResourceInput) (*route53recoverycontrolconfig.TagResourceOutput, error)
	TagResourceWithContext(aws.Context, *route53recoverycontrolconfig.TagResourceInput, ...request.Option) (*route53recoverycontrolconfig.TagResourceOutput, error)
	TagResourceRequest(*route53recoverycontrolconfig.TagResourceInput) (*request.Request, *route53recoverycontrolconfig.TagResourceOutput)

	UntagResource(*route53recoverycontrolconfig.UntagResourceInput) (*route53recoverycontrolconfig.UntagResourceOutput, error)
	UntagResourceWithContext(aws.Context, *route53recoverycontrolconfig.UntagResourceInput, ...request.Option) (*route53recoverycontrolconfig.UntagResourceOutput, error)
	UntagResourceRequest(*route53recoverycontrolconfig.UntagResourceInput) (*request.Request, *route53recoverycontrolconfig.UntagResourceOutput)

	UpdateControlPanel(*route53recoverycontrolconfig.UpdateControlPanelInput) (*route53recoverycontrolconfig.UpdateControlPanelOutput, error)
	UpdateControlPanelWithContext(aws.Context, *route53recoverycontrolconfig.UpdateControlPanelInput, ...request.Option) (*route53recoverycontrolconfig.UpdateControlPanelOutput, error)
	UpdateControlPanelRequest(*route53recoverycontrolconfig.UpdateControlPanelInput) (*request.Request, *route53recoverycontrolconfig.UpdateControlPanelOutput)

	UpdateRoutingControl(*route53recoverycontrolconfig.UpdateRoutingControlInput) (*route53recoverycontrolconfig.UpdateRoutingControlOutput, error)
	UpdateRoutingControlWithContext(aws.Context, *route53recoverycontrolconfig.UpdateRoutingControlInput, ...request.Option) (*route53recoverycontrolconfig.UpdateRoutingControlOutput, error)
	UpdateRoutingControlRequest(*route53recoverycontrolconfig.UpdateRoutingControlInput) (*request.Request, *route53recoverycontrolconfig.UpdateRoutingControlOutput)

	UpdateSafetyRule(*route53recoverycontrolconfig.UpdateSafetyRuleInput) (*route53recoverycontrolconfig.UpdateSafetyRuleOutput, error)
	UpdateSafetyRuleWithContext(aws.Context, *route53recoverycontrolconfig.UpdateSafetyRuleInput, ...request.Option) (*route53recoverycontrolconfig.UpdateSafetyRuleOutput, error)
	UpdateSafetyRuleRequest(*route53recoverycontrolconfig.UpdateSafetyRuleInput) (*request.Request, *route53recoverycontrolconfig.UpdateSafetyRuleOutput)

	WaitUntilClusterCreated(*route53recoverycontrolconfig.DescribeClusterInput) error
	WaitUntilClusterCreatedWithContext(aws.Context, *route53recoverycontrolconfig.DescribeClusterInput, ...request.WaiterOption) error

	WaitUntilClusterDeleted(*route53recoverycontrolconfig.DescribeClusterInput) error
	WaitUntilClusterDeletedWithContext(aws.Context, *route53recoverycontrolconfig.DescribeClusterInput, ...request.WaiterOption) error

	WaitUntilControlPanelCreated(*route53recoverycontrolconfig.DescribeControlPanelInput) error
	WaitUntilControlPanelCreatedWithContext(aws.Context, *route53recoverycontrolconfig.DescribeControlPanelInput, ...request.WaiterOption) error

	WaitUntilControlPanelDeleted(*route53recoverycontrolconfig.DescribeControlPanelInput) error
	WaitUntilControlPanelDeletedWithContext(aws.Context, *route53recoverycontrolconfig.DescribeControlPanelInput, ...request.WaiterOption) error

	WaitUntilRoutingControlCreated(*route53recoverycontrolconfig.DescribeRoutingControlInput) error
	WaitUntilRoutingControlCreatedWithContext(aws.Context, *route53recoverycontrolconfig.DescribeRoutingControlInput, ...request.WaiterOption) error

	WaitUntilRoutingControlDeleted(*route53recoverycontrolconfig.DescribeRoutingControlInput) error
	WaitUntilRoutingControlDeletedWithContext(aws.Context, *route53recoverycontrolconfig.DescribeRoutingControlInput, ...request.WaiterOption) error
}

var _ Route53RecoveryControlConfigAPI = (*route53recoverycontrolconfig.Route53RecoveryControlConfig)(nil)
