package repos

import (
	"database/sql"
)

type DocumentRepo struct {
	db *sql.DB
}

func NewDocumentRepo(db *sql.DB) *DocumentRepo {
	return &DocumentRepo{db: db}
}

// func (r *DocumentRepo) GetDocuments() ([]models.Document, error) {
// 	query := `SELECT id, readable_id, status, source, created_at FROM documents`
// 	rows, err := r.db.Query(query)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var documents []view.Document
// 	for rows.Next() {
// 		var document models.Document
// 		if err := rows.Scan(
// 			&document.ID,
// 			&document.ReadableID,
// 			&document.Status,
// 			&document.Source,
// 			&document.CreatedAt,
// 		); err != nil {
// 			return nil, err
// 		}
// 		documents = append(documents, document)
// 	}

// 	return documents, nil
// }
