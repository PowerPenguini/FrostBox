package repos

import (
	"database/sql"
	"frostbox/models"

	"github.com/google/uuid"
)

type EventTypeRepo struct {
	db *sql.DB
}

func NewEventTypeRepo(db *sql.DB) *EventTypeRepo {
	return &EventTypeRepo{db: db}
}

func (r *EventTypeRepo) GetEventType(eventTypeID uuid.UUID) (*models.EventType, error) {
	query := `
		SELECT id, name, default_cost_category
		FROM event_types
		WHERE id = $1
	`

	row := r.db.QueryRow(query, eventTypeID)

	var et models.EventType
	err := row.Scan(&et.ID, &et.Name, &et.DefaultCostCategory)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &et, nil
}

func (r *EventTypeRepo) Exists(eventTypeID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM event_types WHERE id = $1
		)
	`

	var exists bool
	err := r.db.QueryRow(query, eventTypeID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}
