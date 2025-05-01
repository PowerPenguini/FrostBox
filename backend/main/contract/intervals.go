package contract

import (
	"time"

	"github.com/google/uuid"
)

type GetIntervalsResponse []Interval

type Interval struct {
	IntervalID   uuid.UUID `json:"id"`
	MileageStart int       `json:"mileage_start"`
	MileageEnd   int       `json:"mileage_end"`
	DateStart    time.Time `json:"date_start"`
	DateEnd      time.Time `json:"date_end"`
	Name         string    `json:"name"`
	Status       string    `json:"status"`
}
