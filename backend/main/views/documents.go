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

func (r *DocumentViewer) GetCostDocuments() (contract.DocumentsCostResponse, error) {
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
	WHERE 
		d.type = 'cost'
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

func (r *DocumentViewer) GetRevenueDocuments() (contract.DocumentsRevenueResponse, error) {
	query := `SELECT 
		d.readable_id, 
		d.status, 
		d.source, 
		d.created_at, 
		COUNT(r.id) AS revenues_count
	FROM 
		documents d
	LEFT JOIN 
		revenues r ON d.id = r.document_id
	WHERE 
		d.type = 'revenue'
	GROUP BY 
		d.readable_id, d.status, d.source, d.created_at;
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resp contract.DocumentsRevenueResponse
	for rows.Next() {
		var doc contract.DocumentsRevenue
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
