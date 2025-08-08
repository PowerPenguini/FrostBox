package contract

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type GetEventsResponse []GetEvent

type GetEvent struct {
	ID        uuid.UUID `json:"id"`
	EventType string    `json:"event_type"`
	EventDate time.Time `json:"date"`
	Mileage   *int      `json:"mileage"`
}

type PostVehicleEventRequest struct {
	EventType string      `json:"event_type"`
	EventDate time.Time   `json:"date"`
	Mileage   int         `json:"mileage"`
	Costs     []EventCost `json:"costs"`
}

type EventCost struct {
	Value    decimal.Decimal `json:"value"`
	VatRate  decimal.Decimal `json:"vat_rate"`
	Quantity decimal.Decimal `json:"quantity"`
	Currency string          `json:"currency"`
	Country  string          `json:"country"`
}
