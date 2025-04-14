package logic

import (
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
		return errs.ErrValidationFailed
	}

	vehicle := &models.Vehicle{
		VIN:                vin,
		Brand:              params.Brand,
		Model:              params.Model,
		RegistrationNumber: normalizeRegistrationNumber(params.RegistrationNumber),
	}
	return di.VehicleRepo.Insert(vehicle)
}
