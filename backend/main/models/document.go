package models

import (
	"time"

	"github.com/google/uuid"
)

type DocumentStatus string

const (
	Withdrawn UserRole = "withdrawn"
	Added     UserRole = "added"
	Incorrect UserRole = "incorrect"
)

type Document struct {
	ID         uuid.UUID
	ReadableID string
	Status     DocumentStatus
	Source     string
	CreatedBy  uuid.UUID
	CreatedAt  time.Time
}
