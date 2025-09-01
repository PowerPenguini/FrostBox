package views

import (
	"database/sql"
	"frostbox/contract"

	"github.com/google/uuid"
)

type EventViewer struct {
	db *sql.DB
}

func NewEventViewer(db *sql.DB) *EventViewer {
	return &EventViewer{db: db}
}

func (r *EventViewer) GetEventsByVehicle(vehicleID uuid.UUID) (contract.GetEventsResponse, error) {
	query := `
        SELECT
			e.id,
			et.name AS event_type_name,
			e.event_date,
			e.event_mileage
		FROM
			events e
		JOIN
			event_types et ON e.event_type_id = et.id
		WHERE
			e.vehicle_id = $1
		ORDER BY
			e.event_date DESC,
			e.event_mileage DESC;
    `

	rows, err := r.db.Query(query, vehicleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events contract.GetEventsResponse

	for rows.Next() {
		var e contract.Event
		err := rows.Scan(
			&e.ID,
			&e.EventType,
			&e.EventDate,
			&e.Mileage,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

