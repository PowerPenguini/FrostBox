package validators

import (
	"errors"
	"frostbox/models"
	"frostbox/repos"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type CostValidator struct {
	VehicleRepo  *repos.VehicleRepo
	DocumentRepo *repos.DocumentRepo
}

func NewCostValidator(vr *repos.VehicleRepo, dr *repos.DocumentRepo) *CostValidator {
	return &CostValidator{
		DocumentRepo: dr,
		VehicleRepo:  vr,
	}
}

func (v *CostValidator) Validate(cost *models.Cost) error {
	if cost.Value.IsZero() || cost.Value.IsNegative() {
		return errors.New("cost value must be greater than 0")
	}

	if cost.ValueMainCurrency.IsZero() || cost.ValueMainCurrency.IsNegative() {
		return errors.New("cost value in main currency must be greater than 0")
	}

	if strings.TrimSpace(cost.Currency) == "" {
		return errors.New("currency is required")
	}
	if !validateCurrency(cost.Currency) {
		return errors.New("currency is not supported")
	}

	if strings.TrimSpace(cost.Title) == "" {
		return errors.New("title is required")
	}
	if len(cost.Title) > 255 {
		return errors.New("max title length is 255 characters")
	}

	// Validate cost and invoice dates
	if cost.CostDate.After(time.Now()) {
		return errors.New("cost date cannot be in the future")
	}
	if cost.InvoiceDate.After(time.Now()) {
		return errors.New("invoice date cannot be in the future")
	}

	// Validate quantity
	if cost.Quantity.IsNegative() {
		return errors.New("quantity cannot be negative")
	}

	if cost.VATRate.IsNegative() {
		return errors.New("VAT rate cannot be negative")
	}
	if !cost.VATRate.LessThanOrEqual(decimal.NewFromInt(100)) {
		return errors.New("VAT rate cannot be higher than 100 percent")
	}

	if cost.VATValue.IsNegative() {
		return errors.New("VAT value cannot be negative")
	}
	if !cost.VATValue.LessThanOrEqual(cost.Value) {
		return errors.New("VAT value cannot be greater than cost value")
	}

	if !cost.VATValueMainCurrency.LessThanOrEqual(cost.ValueMainCurrency) {
		return errors.New("VAT value in main currency cannot be greater than cost value in main currency")
	}

	if !validateCountryCode(cost.Country) {
		return errors.New("country is not supported")
	}
	if !validateCostCategory(cost.Category) {
		return errors.New("invalid cost category")
	}

	exists, err := v.VehicleRepo.Exists(*cost.VehicleID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("vehicle does not exist")
	}

	if cost.Amortization < 1 {
		return errors.New("amortization cannot be less than 1 month")
	}

	exists, err = v.DocumentRepo.Exists(*cost.DocumentID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("document does not exist")
	}
	return nil
}
