package handlers

import (
	"encoding/json"
	"frostbox/di"
	"net/http"
)

type DocumentsHandler struct {
	di *di.DI
}

func NewDocumentsHandler(di *di.DI) *DocumentsHandler {
	return &DocumentsHandler{di}
}

func (h *DocumentsHandler) GetDocuments(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.DocumentViewer.GetDocuments()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
