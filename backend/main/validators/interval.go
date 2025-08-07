package validators

import (
	"frostbox/errs"
	"frostbox/repos"

	"github.com/google/uuid"
)

type EventIntervalValidator struct {
	VehicleRepo       *repos.VehicleRepo
	EventIntervalRepo *repos.EventRepo
}

func NewEventIntervalValidator(etr *repos.EventTypeRepo) *EventTypeValidator {
	return &EventTypeValidator{
		EventTypeRepo: etr,
	}
}

func (v *EventTypeValidator) ValidateDelete(id uuid.UUID) error {
	exists, err := v.EventTypeRepo.Exists(id)
	if err != nil {
		return errs.NewError("event_type_check_failed", "failed to verify event type existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("event_type_not_found", "event type does not exist", errs.ValidationType, nil)
	}

	exists, err = v.EventTypeRepo.HasRelatedEvents(id)
	if err != nil {
		return errs.NewError("event_type_dependency_check_failed", "failed to verify event type dependencies", errs.InternalType, err)
	}
	if exists {
		return errs.NewError("event_type_has_dependencies", "event type has dependant events", errs.ValidationType, nil)
	}

	isSystem, err := v.EventTypeRepo.IsSystem(id)
	if err != nil {
		return errs.NewError("event_type_system_check_failed", "failed to verify if event type belongs to system", errs.InternalType, err)
	}
	if isSystem {
		return errs.NewError("event_type_system", "event type belongs to system and cannot be deleted", errs.ValidationType, err)
	}

	return nil
}
