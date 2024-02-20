package errors

import (
	"encoding/json"
	"fmt"
)

type ErrorResponse struct {
	Error     string `json:"error"`
	ErrorCode int    `json:"errorCode"`
}

func AuthError() error {
	bytes, _ := json.Marshal(AuthErrorRaw())
	return fmt.Errorf(string(bytes))
}

func AuthErrorWithDesc(desc string) error {
	bytes, _ := json.Marshal(AuthErrorWithDescRaw(desc))
	return fmt.Errorf(string(bytes))
}

func AuthErrorRaw() ErrorResponse {
	return ErrorResponse{Error: "auth error", ErrorCode: 1}
}

func AuthErrorWithDescRaw(desc string) ErrorResponse {
	return ErrorResponse{Error: fmt.Sprintf("auth error: %v", desc), ErrorCode: 1}
}

func NoRightsError() error {
	bytes, _ := json.Marshal(NoRightsRaw())
	return fmt.Errorf(string(bytes))
}

func NoRightsRaw() ErrorResponse {
	return ErrorResponse{Error: "no rights error", ErrorCode: 2}
}

func RoomNotExistsError() error {
	bytes, _ := json.Marshal(RoomNotExistsRaw())
	return fmt.Errorf(string(bytes))
}

func RoomNotExistsRaw() ErrorResponse {
	return ErrorResponse{Error: "room does not exist", ErrorCode: 3}
}
