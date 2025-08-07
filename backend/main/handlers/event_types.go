package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/logic"
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

func (h *EventsTypesHandler) PostEventsTypes(w http.ResponseWriter, r *http.Request) {
	var req contract.PostEventsTypesReq

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		badRequestInvalidPayload(w)
		return
	}

	act := logic.CreateEventType{
		Name:     req.Name,
		Category: req.Category,
	}
	m, err := act.Execute(h.di)
	if err != nil {
		errs.WriteError(w, err)
		return
	}
	resp := contract.PostEventsTypesResp{
		ID:       *m.ID,
		Name:     m.Name,
		Category: m.Category,
		System:   m.System,
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func (h *EventsTypesHandler) DeleteEventsTypes(w http.ResponseWriter, r *http.Request) {
	etID, err := parseEventTypeID(w, r)
	if err != nil {
		return
	}

	action := &logic.DeleteEventType{ID: etID}
	err = action.Execute(h.di)
	if err != nil {
		errs.WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
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
