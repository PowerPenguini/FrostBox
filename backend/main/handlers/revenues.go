package handlers

import (
	"encoding/json"
	"frostbox/di"
	"net/http"
)

type RevenuesHandler struct {
	di *di.DI
}

func NewRevenuesHandler(di *di.DI) *RevenuesHandler {
	return &RevenuesHandler{di}
}

func (h *RevenuesHandler) GetRevenues(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.RevenueViewer.GetRevenues()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response) // TODO: Every view should return empty array not null 2
}
