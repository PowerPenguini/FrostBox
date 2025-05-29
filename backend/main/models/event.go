package models

import (
	"time"

	"github.com/google/uuid"
)

type Event struct {
	ID           uuid.UUID
	VehicleID    uuid.UUID
	EventTypeID  uuid.UUID
	EventDate    time.Time
	EventMileage *int
	CostID       *uuid.UUID
}
