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

func (h *DocumentsHandler) GetCostDocuments(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.DocumentViewer.GetCostDocuments()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *DocumentsHandler) GetRevenueDocuments(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.DocumentViewer.GetRevenueDocuments()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
