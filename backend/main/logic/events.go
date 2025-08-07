package logic

import (
	"frostbox/di"
	"frostbox/errs"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AddEventWithCostsParams struct {
	EventType    uuid.UUID
	Value        *decimal.Decimal
	VATRate      *decimal.Decimal
	Currency     *string
	VehicleID    *uuid.UUID
	EventDate    time.Time
	EventMileage int
}

// TODO: Add transactions
func (p *AddEventWithCostsParams) Execute(di *di.DI) error {
	eventType, err := di.EventTypeRepo.GetEventType(p.EventType)
	if err != nil {
		return errs.NewError(
			"get_event_type_failed",
			"failed to get event type",
			errs.InternalType,
			err,
		)
	}

	event := &models.Event{
		VehicleID:    *p.VehicleID,
		EventTypeID:  p.EventType,
		EventDate:    p.EventDate,
		EventMileage: &p.EventMileage,
	}

	if err := di.EventValidator.ValidateModel(event); err != nil {
		return err // już zawiera typ i kod błędu z walidatora
	}

	var result AddCostResult
	if p.VATRate != nil && p.Currency != nil && p.Value != nil && *p.Currency != "" {
		result, err = AddCost(di, &AddCostParams{
			Value:        p.Value,
			VATRate:      p.VATRate,
			Currency:     p.Currency,
			Quantity:     decimal.NewFromInt(1),
			VehicleID:    p.VehicleID,
			Title:        eventType.Name,
			Category:     eventType.DefaultCostCategory,
			InvoiceDate:  p.EventDate,
			CostDate:     p.EventDate,
			Amortization: 1,
		})
		if err != nil {
			return errs.NewError(
				"add_cost_failed",
				"failed to add cost for event",
				errs.InternalType,
				err,
			)
		}
	}

	event.CostID = result.ID

	if err := di.EventValidator.ValidateCostID(event); err != nil {
		return err
	}

	if err := di.EventRepo.AddEvent(event); err != nil {
		return errs.NewError(
			"add_event_failed",
			"failed to save event",
			errs.InternalType,
			err,
		)
	}

	return nil
}
