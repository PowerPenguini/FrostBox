package handlers

import (
	"encoding/json"
	"errors"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/logic"
	"net/http"

	"github.com/shopspring/decimal"
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
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response) // TODO: Every view should return empty array not null 2
}

func (h *CostsHandler) PostCosts(w http.ResponseWriter, r *http.Request) { // TODO: Validation
	var cost contract.PostCostsRequest

	err := json.NewDecoder(r.Body).Decode(&cost)
	if err != nil {
		badRequestInvalidPayload(w)
		return
	}

	value, err := decimal.NewFromString(cost.Value)
	if err != nil {
		unprocessableEntityInvalidPayload(w)
		return
	}

	vatRate, err := decimal.NewFromString(cost.VatRate)
	if err != nil {
		unprocessableEntityInvalidPayload(w)
		return
	}

	quantity, err := decimal.NewFromString(cost.Quantity)
	if err != nil {
		unprocessableEntityInvalidPayload(w)
		return
	}

	params := &logic.AddCostParams{
		Value:        &value,
		VATRate:      &vatRate,
		Currency:     &cost.Currency,
		Quantity:     quantity,
		VehicleID:    cost.VehicleID,
		Title:        cost.Title,
		Category:     cost.Category,
		InvoiceDate:  cost.InvoiceDate,
		CostDate:     cost.CostDate,
		Amortization: cost.Amortization,
		Country:      cost.Country,
	}

	_, err = logic.AddCost(h.di, params)
	if errors.Is(err, errs.ErrDataNotAvailable) {
		unprocessableEntityDataNotAvailable(w)
	}
	if err != nil {
		http.Error(w, "Failed to add cost", http.StatusInternalServerError) //TODO: obsłużyć to jako unporcessable entity w zależności od błędu
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}
