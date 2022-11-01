// Code generated by private/model/cli/gen-api/main.go. DO NOT EDIT.

package iotfleetwise

import (
	"github.com/aws/aws-sdk-go/private/protocol"
)

const (

	// ErrCodeAccessDeniedException for service response error code
	// "AccessDeniedException".
	//
	// You don't have sufficient permission to perform this action.
	ErrCodeAccessDeniedException = "AccessDeniedException"

	// ErrCodeConflictException for service response error code
	// "ConflictException".
	//
	// The request has conflicting operations. This can occur if you're trying to
	// perform more than one operation on the same resource at the same time.
	ErrCodeConflictException = "ConflictException"

	// ErrCodeDecoderManifestValidationException for service response error code
	// "DecoderManifestValidationException".
	//
	// The request couldn't be completed because it contains signal decoders with
	// one or more validation errors.
	ErrCodeDecoderManifestValidationException = "DecoderManifestValidationException"

	// ErrCodeInternalServerException for service response error code
	// "InternalServerException".
	//
	// The request couldn't be completed because the server temporarily failed.
	ErrCodeInternalServerException = "InternalServerException"

	// ErrCodeInvalidNodeException for service response error code
	// "InvalidNodeException".
	//
	// The specified node type doesn't match the expected node type for a node.
	// You can specify the node type as branch, sensor, actuator, or attribute.
	ErrCodeInvalidNodeException = "InvalidNodeException"

	// ErrCodeInvalidSignalsException for service response error code
	// "InvalidSignalsException".
	//
	// The request couldn't be completed because it contains signals that aren't
	// valid.
	ErrCodeInvalidSignalsException = "InvalidSignalsException"

	// ErrCodeLimitExceededException for service response error code
	// "LimitExceededException".
	//
	// A service quota was exceeded.
	ErrCodeLimitExceededException = "LimitExceededException"

	// ErrCodeResourceNotFoundException for service response error code
	// "ResourceNotFoundException".
	//
	// The resource wasn't found.
	ErrCodeResourceNotFoundException = "ResourceNotFoundException"

	// ErrCodeThrottlingException for service response error code
	// "ThrottlingException".
	//
	// The request couldn't be completed due to throttling.
	ErrCodeThrottlingException = "ThrottlingException"

	// ErrCodeValidationException for service response error code
	// "ValidationException".
	//
	// The input fails to satisfy the constraints specified by an Amazon Web Services
	// service.
	ErrCodeValidationException = "ValidationException"
)

var exceptionFromCode = map[string]func(protocol.ResponseMetadata) error{
	"AccessDeniedException":              newErrorAccessDeniedException,
	"ConflictException":                  newErrorConflictException,
	"DecoderManifestValidationException": newErrorDecoderManifestValidationException,
	"InternalServerException":            newErrorInternalServerException,
	"InvalidNodeException":               newErrorInvalidNodeException,
	"InvalidSignalsException":            newErrorInvalidSignalsException,
	"LimitExceededException":             newErrorLimitExceededException,
	"ResourceNotFoundException":          newErrorResourceNotFoundException,
	"ThrottlingException":                newErrorThrottlingException,
	"ValidationException":                newErrorValidationException,
}
