package contract

import (
	"time"

	"github.com/google/uuid"
)

type CostsResponse []Cost

type Cost struct {
	ID                        uuid.UUID `json:"id"`
	Value                     float64   `json:"value"`
	Source                    string    `json:"source"`
	Quantity                  float64   `json:"quantity"`
	VehicleRegistrationNumber string    `json:"vehicle_registration_number"`
	VatRate                   float64   `json:"vat_rate"`
	VatValue                  float64   `json:"vat_value"`
	Title                     string    `json:"title"`
	Currency                  string    `json:"currency"`
	Category                  string    `json:"category"`
	Country                   string    `json:"country"`
	InvoiceDate               time.Time `json:"invoice_date"`
	CostDate                  time.Time `json:"cost_date"`
	DocumentID                string    `json:"document_id"`
	CreatedAt                 time.Time `json:"created_at"`
}
