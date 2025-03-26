package models

import "github.com/google/uuid"

type Vehicle struct {
	ID                 uuid.UUID
	VIN                string
	RegistrationNumber string
}
