package models

import (
	"time"

	"github.com/google/uuid"
)

type Cost struct {
	ID                   uuid.UUID  `json:"id"`
	Value                float64    `json:"value"`
	VatRate              float64    `json:"vat_rate"`
	VatValue             float64    `json:"vat_value"`
	Currency             string     `json:"currency"`
	ValueMainCurrency    float64    `json:"value_main_currency"`
	VatValueMainCurrency float64    `json:"vat_value_main_currency"`
	Quantity             float64    `json:"quantity"`
	VehicleID            *uuid.UUID `json:"vehicle_id"`
	Title                string     `json:"title"`
	Category             string     `json:"category"`
	Country              string     `json:"country"`
	InvoiceDate          time.Time  `json:"invoice_date"`
	CostDate             time.Time  `json:"cost_date"`
	DocumentID           *uuid.UUID `json:"document_id"`
	Amortization         int        `json:"amortization"`
	CreatedAt            time.Time  `json:"created_at"`
}
