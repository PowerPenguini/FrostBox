package views

import (
	"database/sql"
	"frostbox/contract"
)

type DocumentViewer struct {
	db *sql.DB
}

func NewDocumentViewer(db *sql.DB) *DocumentViewer {
	return &DocumentViewer{db: db}
}

func (r *DocumentViewer) GetDocuments() (contract.DocumentsCostResponse, error) {
	query := `SELECT 
		d.readable_id, 
		d.status, 
		d.source, 
		d.created_at, 
		COUNT(c.id) AS costs_count
	FROM 
		documents d
	LEFT JOIN 
		costs c ON d.id = c.document_id
	GROUP BY 
		d.readable_id, d.status, d.source, d.created_at;
`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resp contract.DocumentsCostResponse
	for rows.Next() {
		var doc contract.DocumentsCost
		if err := rows.Scan(
			&doc.ID,
			&doc.Status,
			&doc.Source,
			&doc.CreatedAt,
			&doc.CostsNumber,
		); err != nil {
			return nil, err
		}
		resp = append(resp, doc)
	}

	return resp, nil
}
