package contract

import (
	"time"

	"github.com/google/uuid"
)

type GetRevenuesResponse []RevenuesResponse
type GetRevenuesCategoryResponse []string

type RevenuesResponse struct {
	ID                        uuid.UUID `json:"id"`
	Value                     string    `json:"value"`
	Quantity                  string    `json:"quantity"`
	VehicleRegistrationNumber *string   `json:"vehicle_registration_number"`
	VatRate                   string    `json:"vat_rate"`
	VatValue                  string    `json:"vat_value"`
	Title                     string    `json:"title"`
	Currency                  string    `json:"currency"`
	Category                  string    `json:"category"`
	Country                   string    `json:"country"`
	InvoiceDate               time.Time `json:"invoice_date"`
	RevenueDate               time.Time `json:"revenue_date"` // zmiana z CostDate
	DocumentID                *string   `json:"document_id"`  // zawiera d.readable_id
	CreatedAt                 time.Time `json:"created_at"`
}
