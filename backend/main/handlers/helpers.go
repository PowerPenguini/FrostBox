package handlers

import (
	"fmt"
	"frostbox/errs"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func parseVehicleID(w http.ResponseWriter, r *http.Request) (uuid.UUID, error) {
	vehicleIDStr := r.PathValue("vehicle_id")
	vehicleID, err := uuid.Parse(vehicleIDStr)
	if err != nil {
		errs.WriteError(w, errs.NewError("invalid_vehicle_id", "Vehicle ID is not a valid UUID", errs.ValidationType, err))
		return uuid.UUID{}, err
	}
	return vehicleID, nil
}

func parseDateRange(r *http.Request) (time.Time, time.Time, error) {
	query := r.URL.Query()
	startDateStr := query.Get("start_date")
	endDateStr := query.Get("end_date")

	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("invalid start_date format")
		}
	}
	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("invalid end_date format")
		}
	}

	if startDate.IsZero() {
		startDate = time.Now().AddDate(0, -1, 0)
	}
	if endDate.IsZero() {
		endDate = time.Now()
	}

	return startDate, endDate, nil
}
