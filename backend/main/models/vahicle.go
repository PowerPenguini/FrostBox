package models

import "github.com/google/uuid"

type Vehicle struct {
	ID                 uuid.UUID
	VIN                string
	Brand              string
	Model              string
	RegistrationNumber string
}
