package contract

import (
	"time"

	"github.com/google/uuid"
)

type GetEventsResponse []Event

type GetEventsTypes []EventType

type Event struct {
	ID        uuid.UUID `json:"id"`
	EventType string    `json:"event_type"`
	EventDate time.Time `json:"date"`
	Mileage   *int      `json:"mileage"`
}

type EventType struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
