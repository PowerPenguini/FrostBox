package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/logic"
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
	vehicleID, err := parseVehicleID(w, r)
	if err != nil {
		return
	}
	response, err := h.di.EventViewer.GetEventsByVehicle(vehicleID)
	if err != nil {
		errs.WriteError(w, err)
		return
	}
	if response == nil {
		response = contract.GetEventsResponse{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

func (h *EventsHandler) PostEventsByVehicle(w http.ResponseWriter, r *http.Request) {
	vehicleID, err := parseID(w, r, "vehicle_id")
	if err != nil {
		errs.WriteError(w, err)
		return
	}

	var req contract.PostVehicleEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errs.WriteError(w, errs.NewError("invalid_payload", "Invalid JSON payload", errs.BadRequestType, err))
		return
	}

	eventTypeID, err := uuid.Parse(req.EventType)
	if err != nil {
		errs.WriteError(w, errs.NewError("invalid_event_type", "Invalid event type ID", errs.BadRequestType, err))
		return
	}

	act := logic.AddEventWithCosts{
		EventType:    eventTypeID,
		VehicleID:    &vehicleID,
		EventDate:    req.EventDate,
		EventMileage: req.Mileage,
	}

	for _, c := range req.Costs {
		cost := &logic.AddEventWithCostsEventCost{
			Value:    c.Value,
			VATRate:  c.VatRate,
			Quantity: c.Quantity,
			Currency: c.Currency,
			Country:  c.Country,
		}
		act.Costs = append(act.Costs, cost)
	}

	if err := act.Execute(h.di); err != nil {
		errs.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(req)
}
