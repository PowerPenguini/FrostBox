package repos

import (
	"github.com/google/uuid"
)

type DocumentRepo struct {
	db DBTX
}

func NewDocumentRepo(db DBTX) *DocumentRepo {
	return &DocumentRepo{db: db}
}

func (r *DocumentRepo) Exists(id uuid.UUID) (bool, error) {
	query := `SELECT EXISTS (SELECT 1 FROM documents WHERE id = $1)`
	var exists bool
	err := r.db.QueryRow(query, id).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
