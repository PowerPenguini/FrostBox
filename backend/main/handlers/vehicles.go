package handlers

import (
	"encoding/json"
	"frostbox/di"
	"net/http"
)

type VehiclesHandler struct {
	di *di.DI
}

func NewVehiclesHandler(di *di.DI) *VehiclesHandler {
	return &VehiclesHandler{di}
}

func (h *VehiclesHandler) GetVehicles(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.VehicleViewer.GetVehicles()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *VehiclesHandler) GetVehiclesAvailable(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.VehicleViewer.GetVehiclesAvailable()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
