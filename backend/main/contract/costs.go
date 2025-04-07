package contract

import (
	"time"

	"github.com/google/uuid"
)

type GetCostsResponse []CostResponse
type GetCostsCategoryResponse []string
type PostCostsRequest CostRequest

type CostResponse struct {
	ID                        uuid.UUID `json:"id"`
	Value                     string    `json:"value"`
	Quantity                  string    `json:"quantity"`
	VehicleRegistrationNumber *string   `json:"vehicle_registration_number"` // TODO: Legacy?? To remove?
	VatRate                   string    `json:"vat_rate"`
	VatValue                  string    `json:"vat_value"`
	Title                     string    `json:"title"`
	Currency                  string    `json:"currency"`
	Category                  string    `json:"category"`
	Country                   string    `json:"country"`
	InvoiceDate               time.Time `json:"invoice_date"`
	CostDate                  time.Time `json:"cost_date"`
	DocumentID                *string   `json:"document_id"`
	CreatedAt                 time.Time `json:"created_at"`
}

type CostRequest struct {
	Title        string     `json:"title"`
	Value        string     `json:"value"`
	VatRate      string     `json:"vat_rate"`
	Quantity     string     `json:"quantity"`
	VehicleID    *uuid.UUID `json:"vehicle_id"`
	Currency     string     `json:"currency"`
	Category     string     `json:"category"`
	Country      string     `json:"country"`
	InvoiceDate  time.Time  `json:"invoice_date"`
	CostDate     time.Time  `json:"cost_date"`
	Amortization int        `json:"amortization"`
}
