package views

import (
	"database/sql"
	"frostbox/contract"

	"github.com/google/uuid"
)

type IntervalViewer struct {
	db *sql.DB
}

func NewIntervalViewer(db *sql.DB) *IntervalViewer {
	return &IntervalViewer{db: db}
}

func (r *IntervalViewer) GetIntervalsByVehicle(vehicleID uuid.UUID, currentOdometer int) (contract.GetIntervalsResponse, error) {
	query := `
		SELECT
			et.name AS event_type_name,
			ei.id AS event_interval_id,
			e.event_date AS start_date,
			(e.event_date + ei.time_interval) AS end_date,
			e.odometer_km AS start_odometer_km,
			(e.odometer_km + ei.distance_interval_km) AS end_odometer_km
		FROM event_intervals ei
		INNER JOIN event_types et ON ei.event_type_id = et.id
		LEFT JOIN LATERAL (
			SELECT *
			FROM events ev
			WHERE ev.vehicle_id = ei.vehicle_id
			AND ev.event_type_id = ei.event_type_id
			ORDER BY ev.odometer_km DESC, ev.event_date DESC
			LIMIT 1
		) e ON TRUE
		WHERE ei.vehicle_id = $1;
    `

	rows, err := r.db.Query(query, vehicleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var intervals contract.GetIntervalsResponse

	for rows.Next() {
		var i contract.Interval
		err := rows.Scan(
			&i.Name,
			&i.IntervalID,
			&i.DateStart,
			&i.DateEnd,
			&i.MileageStart,
			&i.MileageEnd,
			// &i.IsTimeExpired,
			// &i.IsDistanceExpired,
		)
		if err != nil {
			return nil, err
		}
		intervals = append(intervals, i)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return intervals, nil
}
