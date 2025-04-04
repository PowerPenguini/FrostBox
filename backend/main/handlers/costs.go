package handlers

import (
	"encoding/json"
	"fmt"
	"frostbox/di"
	"frostbox/models"
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
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response) // TODO: Every view should return empty array not null 2
}

func (h *CostsHandler) GetCostsCategories(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.CostViewer.GetCostsCategories()
	if err != nil {
		fmt.Println(err)

		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response) // TODO: Every view should return empty array not null 2
}

func (h *CostsHandler) PostCosts(w http.ResponseWriter, r *http.Request) {
	var cost models.Cost

	err := json.NewDecoder(r.Body).Decode(&cost)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err = h.di.CostRepo.Insert(&cost)
	if err != nil {
		http.Error(w, "Failed to insert", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cost) // Zwracamy wstawiony obiekt kosztu
}
