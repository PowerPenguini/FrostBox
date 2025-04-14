package handlers

import "net/http"

func badRequestInvalidPayload(w http.ResponseWriter) {
	http.Error(w, "Invalid request payload", http.StatusBadRequest)
}
func unprocessableEntityInvalidPayload(w http.ResponseWriter) {
	http.Error(w, "Invalid request payload", http.StatusUnprocessableEntity)
}

func unprocessableEntityDataNotAvailable(w http.ResponseWriter) {
	http.Error(w, "Cannot process data currently", http.StatusUnprocessableEntity)
}
