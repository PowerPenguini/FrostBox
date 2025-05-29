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
        e.event_mileage AS start_event_mileage,
        (e.event_mileage + ei.distance_interval_km) AS end_event_mileage,
        CASE
            WHEN CURRENT_DATE > (e.event_date + ei.time_interval) THEN 'CRITICAL'
            WHEN CURRENT_DATE > (e.event_date + ei.time_interval - ei.warning_offset) THEN 'WARNING'
            ELSE 'INFO'
        END AS status
    FROM event_intervals ei
    INNER JOIN event_types et ON ei.event_type_id = et.id
    LEFT JOIN LATERAL (
        SELECT *
        FROM events ev
        WHERE ev.vehicle_id = ei.vehicle_id
            AND ev.event_type_id = ei.event_type_id
        ORDER BY ev.event_mileage DESC, ev.event_date DESC
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
		var mileageStart sql.NullInt64
		var mileageEnd sql.NullInt64

		err := rows.Scan(
			&i.Name,
			&i.IntervalID,
			&i.DateStart,
			&i.DateEnd,
			&mileageStart,
			&mileageEnd,
			&i.Status,
		)
		if err != nil {
			return nil, err
		}

		if mileageEnd.Valid {
			end := int(mileageEnd.Int64)
			i.MileageEnd = &end

			if mileageStart.Valid {
				start := int(mileageStart.Int64)
				i.MileageStart = &start
			} else {
				i.MileageStart = nil
			}
		} else {
			// mileage_end is NULL, so we hide both
			i.MileageEnd = nil
			i.MileageStart = nil
		}

		intervals = append(intervals, i)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return intervals, nil
}
