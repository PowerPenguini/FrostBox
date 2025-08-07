package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/logic"
	"log"
	"net/http"

	"github.com/google/uuid"
)

type IntervalsHandler struct {
	di *di.DI
}

func NewIntervalsHandler(di *di.DI) *IntervalsHandler {
	return &IntervalsHandler{di}
}

func (h *IntervalsHandler) GetIntervals(w http.ResponseWriter, r *http.Request) {
	vehicle_id := r.PathValue("vehicle_id")
	vehicle_uuid, err := uuid.Parse(vehicle_id)
	if err != nil {
		http.Error(w, "Cannot parse ID", http.StatusBadRequest)
		return
	}

	response, err := h.di.IntervalViewer.GetIntervalsByVehicle(vehicle_uuid, 0)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	if response == nil {
		response = contract.GetIntervalsResponse{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *IntervalsHandler) DeleteIntervals(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(w, r, "event_interval_id")
	if err != nil {
		log.Println(err)
		errs.WriteError(w, err)
		return
	}

	act := logic.DeleteIntervalParams{
		ID: id,
	}
	err = act.Execute(h.di)
	if err != nil {
		log.Println(err)
		errs.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
