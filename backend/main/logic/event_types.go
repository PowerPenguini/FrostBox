package logic

import (
	"frostbox/di"
	"frostbox/errs"
	"frostbox/models"
	"strings"

	"github.com/google/uuid"
)

type DeleteEventType struct {
	ID uuid.UUID
}
type CreateEventType struct {
	Name                string
	DefaultCostCategory string
	Category            string
}

func (p *DeleteEventType) Execute(di *di.DI) error {
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

func (p *CreateEventType) Execute(di *di.DI) (*models.EventType, error) {
	name := strings.TrimSpace(p.Name)
	m := &models.EventType{
		Name:     name,
		System:   false,
		Category: p.Category,
	}
	err := di.EventTypeValidator.ValidateModel(m)
	if err != nil {
		return nil, err
	}

	id, err := di.EventTypeRepo.Insert(m)
	if err != nil {
		return nil, errs.GenericInternal
	}
	m.ID = &id
	return m, nil
}
