package logic

import (
	"frostbox/di"
	"frostbox/errs"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AddIntervalParams struct {
	EventType    uuid.UUID
	Value        *decimal.Decimal
	VATRate      *decimal.Decimal
	Currency     *string
	VehicleID    *uuid.UUID
	EventDate    time.Time
	EventMileage int
}

// TODO: Add transactions
func AddInterval(di *di.DI, params *AddIntervalParams) error {
	eventType, err := di.EventTypeRepo.GetEventType(params.EventType)
	if err != nil {
		return errs.NewError(
			"get_event_type_failed",
			"failed to get event type",
			errs.InternalType,
			err,
		)
	}

	event := &models.Event{
		VehicleID:    *params.VehicleID,
		EventTypeID:  params.EventType,
		EventDate:    params.EventDate,
		EventMileage: &params.EventMileage,
	}

	if err := di.EventValidator.Validate(event); err != nil {
		return err
	}

	var result AddCostResult
	if params.VATRate != nil && params.Currency != nil && params.Value != nil && *params.Currency != "" {
		result, err = AddCost(di, &AddCostParams{
			Value:        params.Value,
			VATRate:      params.VATRate,
			Currency:     params.Currency,
			Quantity:     decimal.NewFromInt(1),
			VehicleID:    params.VehicleID,
			Title:        eventType.Name,
			Category:     eventType.DefaultCostCategory,
			InvoiceDate:  params.EventDate,
			CostDate:     params.EventDate,
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
