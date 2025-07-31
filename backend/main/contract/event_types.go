package contract

import (
	"github.com/google/uuid"
)

type GetEventsTypes []EventType

type EventType struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Category string    `json:"category"`
	System   bool      `json:"system"`
}

type GetEventsTypesCategoriesResponse []string
