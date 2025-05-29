package contract

import (
	"time"

	"github.com/google/uuid"
)

type GetEventsResponse []GetEvent

type GetEventsTypes []EventType

type GetEvent struct {
	ID        uuid.UUID `json:"id"`
	EventType string    `json:"event_type"`
	EventDate time.Time `json:"date"`
	Mileage   *int      `json:"mileage"`
}

type EventType struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type PostVehicleEventRequest struct {
	EventType string    `json:"event_type"`
	EventDate time.Time `json:"date"`
	Mileage   int       `json:"mileage"`
	CostValue string    `json:"cost_value"`
	VATRate   string    `json:"vat_rate"`
	Currency  string    `json:"currency"`
}
