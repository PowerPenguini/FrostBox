package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/logic"
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

func (h *VehiclesHandler) PostVehicles(w http.ResponseWriter, r *http.Request) {
	var vehicle contract.PostVehicleRequest

	err := json.NewDecoder(r.Body).Decode(&vehicle)
	if err != nil {
		badRequestInvalidPayload(w)
		return
	}
	params := logic.AddVehicleParams{ // TOOD: add json keys
		vehicle.VIN,
		vehicle.Brand,
		vehicle.Model,
		vehicle.RegistrationNumber,
	}

	err = logic.AddVehicle(h.di, params)
	if errors.Is(err, errs.ErrValidationFailed) {
		unprocessableEntityInvalidPayload(w)
	}
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to add vehicle", http.StatusInternalServerError) //TODO: obsłużyć to jako unporcessable entity w zależności od błędu
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(vehicle)
}
