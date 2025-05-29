package errs

import "fmt"

const InternalType = "INTERNAL"
const ValidationType = "VALIDATION"
const BadRequestType = "BAD_REQUEST"

type Error struct {
	Code    string
	Message string
	Type    string
	Err     error
}

func (e *Error) Error() string {
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func (e *Error) Unwrap() error {
	return e.Err
}

func NewError(code, msg, typ string, err error) *Error {
	return &Error{
		Code:    code,
		Message: msg,
		Type:    typ,
		Err:     err,
	}
}
