package repos

import (
	"database/sql"
	"frostbox/models"

	"github.com/google/uuid"
)

type EventTypeRepo struct {
	db DBTX
}

func NewEventTypeRepo(db DBTX) *EventTypeRepo {
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

func (r *EventTypeRepo) ExistsByName(name string) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM event_types WHERE name = $1
		)
	`

	var exists bool
	err := r.db.QueryRow(query, name).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *EventTypeRepo) Delete(id uuid.UUID) error {
	query := `
        DELETE FROM event_types
        WHERE id = $1
    `
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *EventTypeRepo) HasRelatedEvents(eventTypeID uuid.UUID) (bool, error) {
	query := `
        SELECT EXISTS (
            SELECT 1 FROM events WHERE event_type_id = $1
        )
    `

	var exists bool
	err := r.db.QueryRow(query, eventTypeID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *EventTypeRepo) IsSystem(eventTypeID uuid.UUID) (bool, error) {
	query := `
		SELECT system
		FROM event_types
		WHERE id = $1
	`

	var isSystem bool
	err := r.db.QueryRow(query, eventTypeID).Scan(&isSystem)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return isSystem, nil
}

func (r *EventTypeRepo) Insert(et *models.EventType) (uuid.UUID, error) {
	var id uuid.UUID

	query := `
        INSERT INTO event_types (name, category, system)
        VALUES ($1, $2, $3)
        RETURNING id;
    `

	err := r.db.QueryRow(query, et.Name, et.Category, et.System).Scan(&id)
	if err != nil {
		return uuid.Nil, err
	}

	return id, nil
}

func (r *EventTypeRepo) SelectEventTypeCategories() ([]string, error) {
	query := `
			SELECT unnest(enum_range(NULL::event_type_category)) AS event_type_category;
		`
	rows, err := r.db.Query(query)
	var categories []string
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	if err != nil {
		return []string{}, err
	}
	return categories, nil
}
