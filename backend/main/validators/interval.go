package validators

import (
	"frostbox/errs"
	"frostbox/repos"

	"github.com/google/uuid"
)

type EventIntervalValidator struct {
	VehicleRepo       *repos.VehicleRepo
	EventIntervalRepo *repos.EventIntervalRepo
}

func NewEventIntervalValidator(vehicleRepo *repos.VehicleRepo, eventIntervalRepo *repos.EventIntervalRepo) *EventIntervalValidator {
	return &EventIntervalValidator{
		VehicleRepo:       vehicleRepo,
		EventIntervalRepo: eventIntervalRepo,
	}
}

func (v *EventIntervalValidator) ValidateDelete(id uuid.UUID) error {
	exists, err := v.EventIntervalRepo.Exists(id)
	if err != nil {
		return errs.NewError("event_interval_check_failed", "failed to verify event interval existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("event_interval_not_found", "event interval does not exist", errs.ValidationType, nil)
	}

	return nil
}
