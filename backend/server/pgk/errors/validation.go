package errors

import (
	"encoding/json"
	"fmt"
)

func DataValidationError(message string) error {
	bytes, _ := json.Marshal(DataValidationErrorRaw(message))
	return fmt.Errorf(string(bytes))
}

func DataValidationErrorRaw(message string) ErrorResponse {
	return ErrorResponse{Error: fmt.Sprintf("data validation error: %v", message), ErrorCode: 4}
}
