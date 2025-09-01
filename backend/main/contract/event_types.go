package contract

import (
	"github.com/google/uuid"
)

type GetEventsTypes []EventType

type EventType struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Category      string    `json:"category"`
	System        bool      `json:"system"`
	ComponentArea string    `json:"component_area"`
}

type PostEventsTypesReq struct {
	Name     string `json:"name"`
	Category string `json:"category"`
}
type PostEventsTypesResp EventType

type GetEventsTypesCategoriesResponse []string
