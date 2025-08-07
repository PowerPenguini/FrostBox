package logic

import (
	"frostbox/di"
	"frostbox/errs"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type DeleteIntervalParams struct {
	EventType    uuid.UUID
	Value        *decimal.Decimal
	VATRate      *decimal.Decimal
	Currency     *string
	VehicleID    *uuid.UUID
	EventDate    time.Time
	EventMileage int
}

// TODO: Add transactions
func (p *DeleteIntervalParams) Execute(di *di.DI) error {
	event_intervals.
}

func (p *DeleteIntervalParams) Execute(di *di.DI) error {
	err := di.EventTypeValidator.ValidateDelete(p.ID)
	if err != nil {
		return err
	}
	err = di.EventTypeRepo.Delete(p.ID)
	if err != nil {
		return errs.GenericInternal
	}
	return nil
}