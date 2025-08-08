package validators

import (
	"frostbox/errs"
	"frostbox/models"
	"frostbox/repos"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type CostValidator struct {
	EventRepo    *repos.EventRepo
	VehicleRepo  *repos.VehicleRepo
	DocumentRepo *repos.DocumentRepo
}

func NewCostValidator(er *repos.EventRepo, vr *repos.VehicleRepo, dr *repos.DocumentRepo) *CostValidator {
	return &CostValidator{
		EventRepo:    er,
		DocumentRepo: dr,
		VehicleRepo:  vr,
	}
}

func (v *CostValidator) Validate(cost *models.Cost) error {
	if cost.Value.IsZero() || cost.Value.IsNegative() {
		return errs.NewError("cost_value_invalid", "cost value must be greater than 0", errs.ValidationType, nil)
	}

	if cost.ValueMainCurrency.IsZero() || cost.ValueMainCurrency.IsNegative() {
		return errs.NewError("cost_value_main_currency_invalid", "cost value in main currency must be greater than 0", errs.ValidationType, nil)
	}

	if strings.TrimSpace(cost.Currency) == "" {
		return errs.NewError("cost_currency_required", "currency is required", errs.ValidationType, nil)
	}
	if !validateCurrency(cost.Currency) {
		return errs.NewError("cost_currency_unsupported", "currency is not supported", errs.ValidationType, nil)
	}

	if strings.TrimSpace(cost.Title) == "" {
		return errs.NewError("cost_title_required", "title is required", errs.ValidationType, nil)
	}
	if len(cost.Title) > 255 {
		return errs.NewError("cost_title_too_long", "max title length is 255 characters", errs.ValidationType, nil)
	}

	if cost.CostDate.After(time.Now()) {
		return errs.NewError("cost_date_in_future", "cost date cannot be in the future", errs.ValidationType, nil)
	}
	if cost.InvoiceDate.After(time.Now()) {
		return errs.NewError("invoice_date_in_future", "invoice date cannot be in the future", errs.ValidationType, nil)
	}

	if cost.Quantity.IsNegative() {
		return errs.NewError("cost_quantity_negative", "quantity cannot be negative", errs.ValidationType, nil)
	}

	if cost.VATRate.IsNegative() {
		return errs.NewError("cost_vat_rate_negative", "VAT rate cannot be negative", errs.ValidationType, nil)
	}
	if !cost.VATRate.LessThanOrEqual(decimal.NewFromInt(100)) {
		return errs.NewError("cost_vat_rate_too_high", "VAT rate cannot be higher than 100 percent", errs.ValidationType, nil)
	}

	if cost.VATValue.IsNegative() {
		return errs.NewError("cost_vat_value_negative", "VAT value cannot be negative", errs.ValidationType, nil)
	}
	if !cost.VATValue.LessThanOrEqual(cost.Value) {
		return errs.NewError("cost_vat_value_too_high", "VAT value cannot be greater than cost value", errs.ValidationType, nil)
	}

	if !cost.VATValueMainCurrency.LessThanOrEqual(cost.ValueMainCurrency) {
		return errs.NewError("cost_vat_value_main_currency_too_high", "VAT value in main currency cannot be greater than cost value in main currency", errs.ValidationType, nil)
	}

	if !validateCountryCode(cost.Country) {
		return errs.NewError("cost_country_unsupported", "country is not supported", errs.ValidationType, nil)
	}
	if !validateCostCategory(cost.Category) {
		return errs.NewError("cost_category_invalid", "invalid cost category", errs.ValidationType, nil)
	}

	exists, err := v.VehicleRepo.Exists(*cost.VehicleID)
	if err != nil {
		return errs.NewError("vehicle_check_failed", "failed to verify vehicle existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("vehicle_not_found", "vehicle does not exist", errs.ValidationType, nil)
	}

	if cost.Amortization < 1 {
		return errs.NewError("cost_amortization_too_low", "amortization cannot be less than 1 month", errs.ValidationType, nil)
	}

	exists, err = v.DocumentRepo.Exists(*cost.DocumentID)
	if err != nil {
		return errs.NewError("document_check_failed", "failed to verify document existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("document_not_found", "document does not exist", errs.ValidationType, nil)
	}

	exists, err = v.EventRepo.Exists(*cost.EventID)
	if err != nil {
		return errs.NewError("event_check_failed", "failed to verify event existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("event_not_found", "event does not exist", errs.ValidationType, nil)
	}

	return nil
}
