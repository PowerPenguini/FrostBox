package views

import (
	"database/sql"
	"frostbox/contract"
)

type EventTypeViewer struct {
	db *sql.DB
}

func NewEventTypeViewer(db *sql.DB) *EventTypeViewer {
	return &EventTypeViewer{db: db}
}

func (r *EventTypeViewer) GetEventTypeCategories() (contract.GetEventsTypesCategoriesResponse, error) {
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
		return contract.GetEventsTypesCategoriesResponse{}, err
	}
	return categories, nil
}

func (r *EventViewer) GetEventsTypes() (contract.GetEventsTypes, error) {
	query := `
		SELECT id, name, category, system, description, component_area FROM event_types;
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var types contract.GetEventsTypes

	for rows.Next() {
		var e contract.EventType
		err := rows.Scan(
			&e.ID,
			&e.Name,
			&e.Category,
			&e.System,
			&e.Description,
			&e.ComponentArea,
		)
		if err != nil {
			return nil, err
		}
		types = append(types, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return types, nil
}
