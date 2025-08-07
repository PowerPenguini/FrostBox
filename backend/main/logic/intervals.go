package logic

import (
	"frostbox/di"
	"frostbox/errs"

	"github.com/google/uuid"
)

type DeleteIntervalParams struct {
	ID uuid.UUID
}

func (p *DeleteIntervalParams) Execute(di *di.DI) error {
	err := di.EventIntervalValidator.ValidateDelete(p.ID)
	if err != nil {
		return err
	}
	err = di.EventIntervalRepo.Delete(p.ID)
	if err != nil {
		return errs.GenericInternal
	}
	return nil
}
