package logic

import (
	"errors"
	"frostbox/di"
	"frostbox/errs"
	"frostbox/models"
	"frostbox/validators"
	"strings"
	"unicode"
)

type AddVehicleParams struct {
	VIN                string
	Brand              string
	Model              string
	RegistrationNumber string
}

func normalizeRegistrationNumber(input string) string {
	withoutWhitespace := strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, input)

	return strings.ToUpper(withoutWhitespace)
}

func AddVehicle(di *di.DI, params AddVehicleParams) error {
	vin := strings.ToUpper(params.VIN)
	if !validators.ValidateVIN(vin) ||
		!validators.ValidatePLRegistrationNumber(params.RegistrationNumber) {
		return errors.New("vehicle validation failed") // TODO: Get proper fuckin validator here
	}

	vehicle := &models.Vehicle{
		VIN:                vin,
		Brand:              params.Brand,
		Model:              params.Model,
		RegistrationNumber: normalizeRegistrationNumber(params.RegistrationNumber),
	}
	if err := di.VehicleRepo.Insert(vehicle); err != nil {
		return errs.GenericInternal
	}
	return nil
}
