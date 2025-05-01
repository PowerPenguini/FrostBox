package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/di"
	"net/http"

	"github.com/google/uuid"
)

type EventsHandler struct {
	di *di.DI
}

func NewEventsHandler(di *di.DI) *EventsHandler {
	return &EventsHandler{di}
}

func (h *EventsHandler) GetEventsByVehicle(w http.ResponseWriter, r *http.Request) {
	vehicle_id := r.PathValue("vehicle_id")
	vehicle_uuid, err := uuid.Parse(vehicle_id)
	if err != nil {
		http.Error(w, "Cannot parse ID", http.StatusBadRequest)
		return
	}

	response, err := h.di.EventViewer.GetEventsByVehicle(vehicle_uuid)
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	if response == nil {
		response = contract.GetEventsResponse{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *EventsHandler) GetEventsTypes(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.EventViewer.GetEventsTypes()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	if response == nil {
		response = contract.GetEventsTypes{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
