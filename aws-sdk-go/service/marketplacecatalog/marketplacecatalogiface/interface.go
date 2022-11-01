// Code generated by private/model/cli/gen-api/main.go. DO NOT EDIT.

// Package marketplacecatalogiface provides an interface to enable mocking the AWS Marketplace Catalog Service service client
// for testing your code.
//
// It is important to note that this interface will have breaking changes
// when the service model is updated and adds new API operations, paginators,
// and waiters.
package marketplacecatalogiface

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/service/marketplacecatalog"
)

// MarketplaceCatalogAPI provides an interface to enable mocking the
// marketplacecatalog.MarketplaceCatalog service client's API operation,
// paginators, and waiters. This make unit testing your code that calls out
// to the SDK's service client's calls easier.
//
// The best way to use this interface is so the SDK's service client's calls
// can be stubbed out for unit testing your code with the SDK without needing
// to inject custom request handlers into the SDK's request pipeline.
//
//	// myFunc uses an SDK service client to make a request to
//	// AWS Marketplace Catalog Service.
//	func myFunc(svc marketplacecatalogiface.MarketplaceCatalogAPI) bool {
//	    // Make svc.CancelChangeSet request
//	}
//
//	func main() {
//	    sess := session.New()
//	    svc := marketplacecatalog.New(sess)
//
//	    myFunc(svc)
//	}
//
// In your _test.go file:
//
//	// Define a mock struct to be used in your unit tests of myFunc.
//	type mockMarketplaceCatalogClient struct {
//	    marketplacecatalogiface.MarketplaceCatalogAPI
//	}
//	func (m *mockMarketplaceCatalogClient) CancelChangeSet(input *marketplacecatalog.CancelChangeSetInput) (*marketplacecatalog.CancelChangeSetOutput, error) {
//	    // mock response/functionality
//	}
//
//	func TestMyFunc(t *testing.T) {
//	    // Setup Test
//	    mockSvc := &mockMarketplaceCatalogClient{}
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
type MarketplaceCatalogAPI interface {
	CancelChangeSet(*marketplacecatalog.CancelChangeSetInput) (*marketplacecatalog.CancelChangeSetOutput, error)
	CancelChangeSetWithContext(aws.Context, *marketplacecatalog.CancelChangeSetInput, ...request.Option) (*marketplacecatalog.CancelChangeSetOutput, error)
	CancelChangeSetRequest(*marketplacecatalog.CancelChangeSetInput) (*request.Request, *marketplacecatalog.CancelChangeSetOutput)

	DescribeChangeSet(*marketplacecatalog.DescribeChangeSetInput) (*marketplacecatalog.DescribeChangeSetOutput, error)
	DescribeChangeSetWithContext(aws.Context, *marketplacecatalog.DescribeChangeSetInput, ...request.Option) (*marketplacecatalog.DescribeChangeSetOutput, error)
	DescribeChangeSetRequest(*marketplacecatalog.DescribeChangeSetInput) (*request.Request, *marketplacecatalog.DescribeChangeSetOutput)

	DescribeEntity(*marketplacecatalog.DescribeEntityInput) (*marketplacecatalog.DescribeEntityOutput, error)
	DescribeEntityWithContext(aws.Context, *marketplacecatalog.DescribeEntityInput, ...request.Option) (*marketplacecatalog.DescribeEntityOutput, error)
	DescribeEntityRequest(*marketplacecatalog.DescribeEntityInput) (*request.Request, *marketplacecatalog.DescribeEntityOutput)

	ListChangeSets(*marketplacecatalog.ListChangeSetsInput) (*marketplacecatalog.ListChangeSetsOutput, error)
	ListChangeSetsWithContext(aws.Context, *marketplacecatalog.ListChangeSetsInput, ...request.Option) (*marketplacecatalog.ListChangeSetsOutput, error)
	ListChangeSetsRequest(*marketplacecatalog.ListChangeSetsInput) (*request.Request, *marketplacecatalog.ListChangeSetsOutput)

	ListChangeSetsPages(*marketplacecatalog.ListChangeSetsInput, func(*marketplacecatalog.ListChangeSetsOutput, bool) bool) error
	ListChangeSetsPagesWithContext(aws.Context, *marketplacecatalog.ListChangeSetsInput, func(*marketplacecatalog.ListChangeSetsOutput, bool) bool, ...request.Option) error

	ListEntities(*marketplacecatalog.ListEntitiesInput) (*marketplacecatalog.ListEntitiesOutput, error)
	ListEntitiesWithContext(aws.Context, *marketplacecatalog.ListEntitiesInput, ...request.Option) (*marketplacecatalog.ListEntitiesOutput, error)
	ListEntitiesRequest(*marketplacecatalog.ListEntitiesInput) (*request.Request, *marketplacecatalog.ListEntitiesOutput)

	ListEntitiesPages(*marketplacecatalog.ListEntitiesInput, func(*marketplacecatalog.ListEntitiesOutput, bool) bool) error
	ListEntitiesPagesWithContext(aws.Context, *marketplacecatalog.ListEntitiesInput, func(*marketplacecatalog.ListEntitiesOutput, bool) bool, ...request.Option) error

	StartChangeSet(*marketplacecatalog.StartChangeSetInput) (*marketplacecatalog.StartChangeSetOutput, error)
	StartChangeSetWithContext(aws.Context, *marketplacecatalog.StartChangeSetInput, ...request.Option) (*marketplacecatalog.StartChangeSetOutput, error)
	StartChangeSetRequest(*marketplacecatalog.StartChangeSetInput) (*request.Request, *marketplacecatalog.StartChangeSetOutput)
}

var _ MarketplaceCatalogAPI = (*marketplacecatalog.MarketplaceCatalog)(nil)
