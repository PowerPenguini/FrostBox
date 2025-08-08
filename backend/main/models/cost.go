package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Cost struct {
	ID                   *uuid.UUID
	Value                decimal.Decimal
	VATRate              decimal.Decimal
	VATValue             decimal.Decimal
	Currency             string
	ValueMainCurrency    decimal.Decimal
	VATValueMainCurrency decimal.Decimal
	Quantity             decimal.Decimal
	VehicleID            *uuid.UUID
	Title                string
	Category             string
	Country              string
	InvoiceDate          time.Time
	CostDate             time.Time
	DocumentID           *uuid.UUID
	EventID              *uuid.UUID
	Amortization         int
	CreatedAt            time.Time
}
