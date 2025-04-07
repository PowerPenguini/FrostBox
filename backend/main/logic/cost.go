package logic

import (
	"frostbox/di"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AddCostParams struct {
	Value        decimal.Decimal
	VATRate      decimal.Decimal
	Currency     string
	Quantity     decimal.Decimal
	VehicleID    *uuid.UUID
	Title        string
	Category     string
	InvoiceDate  time.Time
	CostDate     time.Time
	Amortization int
	Country      string
}

func AddCost(di *di.DI, params AddCostParams) error {
	vatValue := params.Value.Mul(params.VATRate).Div(decimal.NewFromInt(100))
	currencyDate := params.InvoiceDate.AddDate(0, 0, -1)

	valueMainCurrency, err := di.NBPService.ToPLN(params.Currency, params.Value, currencyDate)
	if err != nil {
		return err
	}

	vatValueMainCurrency, err := di.NBPService.ToPLN(params.Currency, vatValue, currencyDate)
	if err != nil {
		return err
	}
	cost := &models.Cost{
		Value:                params.Value,
		VATRate:              params.VATRate,
		VATValue:             vatValue,
		Currency:             params.Currency,
		ValueMainCurrency:    valueMainCurrency,
		VatValueMainCurrency: vatValueMainCurrency,
		Quantity:             params.Quantity,
		VehicleID:            params.VehicleID,
		Title:                params.Title,
		Category:             params.Category,
		Country:              params.Country,
		InvoiceDate:          params.InvoiceDate,
		CostDate:             params.CostDate,
		Amortization:         params.Amortization,
	}
	err = di.CostRepo.Insert(cost)
	return err
}
