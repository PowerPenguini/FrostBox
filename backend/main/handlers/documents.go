package handlers

import (
	"encoding/json"
	"net/http"
	"voltdesk/contract"
	"voltdesk/di"
)

type DocumentHandler struct {
	di *di.DI
}

func NewDocumentsHandler(di *di.DI) *DocumentHandler {
	return &DocumentHandler{di}
}

func (h *DocumentHandler) GetDocuments(w http.ResponseWriter, r *http.Request) {
	docs, err := h.di.DocumentRepo.GetDocuments()
	if err != nil {
		http.Error(w, "Failed to fetch documents", http.StatusInternalServerError)
		return
	}
	var response []contract.DocumentCostResponse
	for _, doc := range docs {
		response = append(response, contract.DocumentCostResponse{
			ID:         doc.ID,
			ReadableID: doc.ReadableID,
			Status:     string(doc.Status),
			Source:     doc.Source,
			CreatedAt:  doc.CreatedAt,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
