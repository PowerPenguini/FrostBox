package errs

import (
	"encoding/json"
	"errors"
	"net/http"
)

func WriteError(w http.ResponseWriter, err error) {
	var e *Error
	if errors.As(err, &e) {
		status := http.StatusInternalServerError
		switch e.Type {
		case ValidationType:
			status = http.StatusUnprocessableEntity
		case InternalType:
			status = http.StatusInternalServerError
		default:
			status = http.StatusBadRequest
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		json.NewEncoder(w).Encode(map[string]string{
			"error":   e.Code,
			"message": e.Message,
		})
		return
	}
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]string{
		"error":   "unknown_error",
		"message": err.Error(),
	})

}
