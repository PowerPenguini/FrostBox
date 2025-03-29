package handlers

import (
	"encoding/json"
	"frostbox/di"
	"net/http"
)

type CostsHandler struct {
	di *di.DI
}

func NewCostsHandler(di *di.DI) *CostsHandler {
	return &CostsHandler{di}
}

func (h *CostsHandler) GetCosts(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.CostViewer.GetCosts()
	if err != nil {
		http.Error(w, "Failed to fetch Costs", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
