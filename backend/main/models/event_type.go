package models

import "github.com/google/uuid"

type EventType struct {
	ID   *uuid.UUID
	Name string
	// DefaultCostCategory string
	Category string
	System   bool
}
