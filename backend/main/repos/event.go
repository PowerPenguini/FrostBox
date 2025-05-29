package repos

import (
	"database/sql"
	"frostbox/models"

	"github.com/google/uuid"
)

type EventRepo struct {
	db *sql.DB
}

func NewEventRepo(db *sql.DB) *EventRepo {
	return &EventRepo{db: db}
}

func (r *EventRepo) AddEvent(e *models.Event) error {
	query := `
		INSERT INTO events (vehicle_id, event_type_id, event_date, event_mileage)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := r.db.QueryRow(
		query,
		e.VehicleID,
		e.EventTypeID,
		e.EventDate,
		e.EventMileage,
	).Scan(&e.ID)

	return err
}

func (r *EventRepo) GetLastEventByVehicle(vehicleID uuid.UUID) (*models.Event, error) {
	query := `
		SELECT id, vehicle_id, event_type_id, event_date, event_mileage
		FROM events
		WHERE vehicle_id = $1
		ORDER BY event_mileage DESC, event_date DESC
		LIMIT 1
	`

	row := r.db.QueryRow(query, vehicleID)

	var e models.Event
	err := row.Scan(&e.ID, &e.VehicleID, &e.EventTypeID, &e.EventDate, &e.EventMileage)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	return &e, nil
}
