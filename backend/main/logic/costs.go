package logic

import (
	"frostbox/di"
	"frostbox/errs"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AddCost struct {
	Value        *decimal.Decimal
	VATRate      *decimal.Decimal
	Currency     *string
	Quantity     decimal.Decimal
	VehicleID    *uuid.UUID
	Title        string
	Category     string
	InvoiceDate  time.Time
	CostDate     time.Time
	Amortization int
	Country      string
	EventID      *uuid.UUID
}

type AddCostResult struct {
	ID *uuid.UUID
}

func (p *AddCost) Execute(di *di.DI) (AddCostResult, error) {
	vatValue := p.Value.Mul(*p.VATRate).Div(decimal.NewFromInt(100))
	currencyDate := p.InvoiceDate.AddDate(0, 0, -1)

	var result AddCostResult
	valueMainCurrency, err := di.NBPService.ToPLN(*p.Currency, *p.Value, currencyDate)
	if err != nil {
		return result, errs.NewError("currency_exchagne_failed", "value currency exchange failed due to internal error", errs.InternalType, err)
	}

	vatValueMainCurrency, err := di.NBPService.ToPLN(*p.Currency, vatValue, currencyDate)
	if err != nil {
		return result, errs.NewError("vat_currency_exchagne_failed", "vat value currency exchange failed due to internal error", errs.InternalType, err)
	}
	cost := &models.Cost{
		Value:                *p.Value,
		VATRate:              *p.VATRate,
		VATValue:             vatValue,
		Currency:             *p.Currency,
		ValueMainCurrency:    valueMainCurrency,
		VATValueMainCurrency: vatValueMainCurrency,
		Quantity:             p.Quantity,
		VehicleID:            p.VehicleID,
		Title:                p.Title,
		Category:             p.Category,
		Amortization:         p.Amortization,
		InvoiceDate:          p.InvoiceDate,
		CostDate:             p.CostDate,
		Country:              "POL", // FIXME: Add real country
		// Country:              p.Country,

	}
	err = di.CostValidator.Validate(cost)
	if err != nil {
		return AddCostResult{}, err
	}
	id, err := di.CostRepo.Insert(cost)
	return AddCostResult{id}, err
}
