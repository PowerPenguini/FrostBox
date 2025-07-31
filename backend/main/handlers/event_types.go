package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"net/http"
)

type EventsTypesHandler struct {
	di *di.DI
}

func NewEventsTypesHandler(di *di.DI) *EventsTypesHandler {
	return &EventsTypesHandler{di}
}

func (h *EventsTypesHandler) GetEventsTypes(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.EventViewer.GetEventsTypes()
	if err != nil {
		errs.WriteError(w, err)
		return
	}
	if response == nil {
		response = contract.GetEventsTypes{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

func (h *EventsTypesHandler) GetEventsTypesCategories(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.EventTypeViewer.GetEventTypeCategories()
	if err != nil {
		errs.WriteError(w, err)
		return
	}
	if response == nil {
		response = contract.GetEventsTypesCategoriesResponse{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}
