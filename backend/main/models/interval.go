package models

import (
	"time"

	"github.com/google/uuid"
)

type EventInterval struct {
	ID            uuid.UUID
	VehicleID     uuid.UUID
	EventTypeID   uuid.UUID
	DistanceKM    *int
	TimeInterval  *time.Duration
	WarningOffset time.Duration
}
