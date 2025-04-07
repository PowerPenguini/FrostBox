package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Cost struct {
	ID                   *uuid.UUID      `json:"id"`
	Value                decimal.Decimal `json:"value"`
	VATRate              decimal.Decimal `json:"vat_rate"`
	VATValue             decimal.Decimal `json:"vat_value"`
	Currency             string          `json:"currency"`
	ValueMainCurrency    decimal.Decimal `json:"value_main_currency"`
	VatValueMainCurrency decimal.Decimal `json:"vat_value_main_currency"`
	Quantity             decimal.Decimal `json:"quantity"`
	VehicleID            *uuid.UUID      `json:"vehicle_id"`
	Title                string          `json:"title"`
	Category             string          `json:"category"`
	Country              string          `json:"country"`
	InvoiceDate          time.Time       `json:"invoice_date"`
	CostDate             time.Time       `json:"cost_date"`
	DocumentID           *uuid.UUID      `json:"document_id"`
	Amortization         int             `json:"amortization"`
	CreatedAt            time.Time       `json:"created_at"`
}
