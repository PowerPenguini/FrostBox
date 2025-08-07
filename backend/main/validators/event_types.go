package validators

import (
	"frostbox/errs"
	"frostbox/models"
	"frostbox/repos"
	"slices"
	"unicode"

	"github.com/google/uuid"
)

type EventTypeValidator struct {
	VehicleRepo   *repos.VehicleRepo
	CostRepo      *repos.CostRepo
	EventRepo     *repos.EventRepo
	EventTypeRepo *repos.EventTypeRepo
}

func NewEventTypeValidator(etr *repos.EventTypeRepo) *EventTypeValidator {
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

func (v *EventTypeValidator) ValidateModel(m *models.EventType) error { // TODO: DEFAULT COST CAT?? Needed? for now unused
	exists, err := v.EventTypeRepo.ExistsByName(m.Name)
	if err != nil {
		return errs.NewError("event_type_check_failed", "failed to verify event type existence", errs.InternalType, err)
	}
	if exists {
		return errs.NewError("event_type_already_exists", "event type with his name already exists", errs.ValidationType, nil)
	}
	if err := v.ValidateName(m.Name); err != nil {
		return err
	}

	cats, err := v.EventTypeRepo.SelectEventTypeCategories()
	if err != nil {
		return errs.NewError("event_type_check_failed", "failed to verify event type existence", errs.InternalType, err)
	}
	if !slices.Contains(cats, m.Category) {
		return errs.NewError("event_type_incorrect_category", "category is incorrect", errs.ValidationType, err)
	}
	return nil
}

func (v *EventTypeValidator) ValidateName(n string) error {
	if len(n) == 0 {
		return errs.NewError("event_type_empty_name", "event type name cannot be empty", errs.ValidationType, nil)
	}

	runes := []rune(n)
	if unicode.IsSpace(runes[0]) || unicode.IsSpace(runes[len(runes)-1]) {
		return errs.NewError("event_type_incorrect_name", "event type name be start or end with whitespaces", errs.InternalType, nil)
	}

	for _, r := range n {
		if !unicode.IsLetter(r) && !unicode.IsNumber(r) && r != ' ' {
			return errs.NewError("event_type_incorrect_name", "name must contain only alphanumerical characters and spaces", errs.ValidationType, nil)
		}
	}
	return nil
}
