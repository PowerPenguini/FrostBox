package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/logic"
	"net/http"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
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
	vehicleID, err := uuid.Parse(r.PathValue("vehicle_id"))
	if err != nil {
		errs.WriteError(w, errs.NewError("invalid_vehicle_id", "Invalid vehicle ID", errs.BadRequestType, err))
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

	var (
		eventValue *decimal.Decimal
		vatRate    *decimal.Decimal
		currency   *string
	)

	// ?? validation rule
	if req.CostValue != "" {
		val, err := decimal.NewFromString(req.CostValue)
		if err != nil {
			errs.WriteError(w, errs.NewError("invalid_cost_value", "Cost value must be a decimal", errs.BadRequestType, err))
			return
		}
		eventValue = &val
	}

	if req.VATRate != "" {
		val, err := decimal.NewFromString(req.VATRate)
		if err != nil {
			errs.WriteError(w, errs.NewError("invalid_vat_rate", "VAT rate must be a decimal", errs.ValidationType, err))
			return
		}
		vatRate = &val
	}

	if req.Currency != "" {
		currency = &req.Currency
	}

	params := &logic.AddEventWithCostParams{
		EventType:    eventTypeID,
		Value:        eventValue,
		VATRate:      vatRate,
		Currency:     currency,
		VehicleID:    &vehicleID,
		EventDate:    req.EventDate,
		EventMileage: req.Mileage,
	}

	if err := logic.AddEventWithCost(h.di, params); err != nil {
		errs.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(req)
}
