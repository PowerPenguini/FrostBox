package validators

import (
	"frostbox/errs"
	"frostbox/models"
	"frostbox/repos"
	"time"

	"github.com/google/uuid"
)

type EventValidator struct {
	VehicleRepo   *repos.VehicleRepo
	CostRepo      *repos.CostRepo
	EventRepo     *repos.EventRepo
	EventTypeRepo *repos.EventTypeRepo
}

func NewEventValidator(vr *repos.VehicleRepo, cr *repos.CostRepo, er *repos.EventRepo, etr *repos.EventTypeRepo) *EventValidator {
	return &EventValidator{
		VehicleRepo:   vr,
		CostRepo:      cr,
		EventRepo:     er,
		EventTypeRepo: etr,
	}
}

func (v *EventValidator) ValidateModel(event *models.Event) error {
	if event.VehicleID == uuid.Nil {
		return errs.NewError("vehicle_id_required", "vehicle ID is required", errs.ValidationType, nil)
	}
	if event.EventTypeID == uuid.Nil {
		return errs.NewError("event_type_id_required", "event type ID is required", errs.ValidationType, nil)
	}
	if event.EventMileage != nil && *event.EventMileage < 0 {
		return errs.NewError("negative_event_mileage", "event mileage cannot be negative", errs.ValidationType, nil)
	}
	if event.EventDate.After(time.Now()) {
		return errs.NewError("future_event_date", "event date cannot be in the future", errs.ValidationType, nil)
	}

	exists, err := v.VehicleRepo.Exists(event.VehicleID)
	if err != nil {
		return errs.NewError("vehicle_check_failed", "failed to verify vehicle existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("vehicle_not_found", "event vehicle does not exist", errs.ValidationType, nil)
	}

	etypeExists, err := v.EventTypeRepo.Exists(event.EventTypeID)
	if err != nil {
		return errs.NewError("event_type_check_failed", "failed to verify event type", errs.InternalType, err)
	}
	if !etypeExists {
		return errs.NewError("event_type_not_found", "event type does not exist", errs.ValidationType, nil)
	}

	if event.EventMileage != nil {
		lastEvent, err := v.EventRepo.GetLastEventByVehicle(event.VehicleID)
		if err != nil {
			return errs.NewError("last_event_fetch_failed", "failed to fetch last event for vehicle", errs.InternalType, err)
		}
		if lastEvent != nil && lastEvent.EventMileage != nil && *event.EventMileage < *lastEvent.EventMileage {
			return errs.NewError("event_mileage_regression", "event mileage cannot be lower than mileage from last event", errs.ValidationType, nil)
		}
	}

	if err := v.ValidateCostID(event); err != nil {
		return err
	}

	return nil
}

func (v *EventValidator) ValidateCostID(event *models.Event) error {
	if event.CostID == nil {
		return nil
	}
	exists, err := v.CostRepo.Exists(*event.CostID)
	if err != nil {
		return errs.NewError("cost_check_failed", "failed to verify cost existence", errs.InternalType, err)
	}
	if !exists {
		return errs.NewError("cost_not_found", "event cost does not exist", errs.ValidationType, nil)
	}
	return nil
}
