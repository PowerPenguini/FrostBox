package repos

import (
	"database/sql"

	"github.com/google/uuid"
)

type IntervalRepo struct {
	db *sql.DB
}

func NewIntervalRepo(db *sql.DB) *IntervalRepo {
	return &IntervalRepo{db: db}
}

func (r *IntervalRepo) Delete(id uuid.UUID) error {
	query := `
        DELETE FROM event_intervals
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

// CREATE TABLE
//     event_intervals (
//         vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
//         event_type_id UUID NOT NULL REFERENCES event_types (id) ON DELETE CASCADE,
//         distance_interval_km INT,
//         time_interval INTERVAL,
//         warning_offset INTERVAL NOT NULL -- km/data // Counter
//     );
