package views

import (
	"database/sql"
	"frostbox/contract"
)

type CostViewer struct {
	db *sql.DB
}

func NewCostViewer(db *sql.DB) *CostViewer {
	return &CostViewer{db: db}
}

func (r *CostViewer) GetCosts() (contract.CostsResponse, error) {
	query := `SELECT 
		c.id, 
		c.value, 
		c.source, 
		c.quantity, 
		c.vat_rate, 
		c.vat_value, 
		c.title, 
		c.currency, 
		c.category, 
		c.country, 
		c.invoice_date, 
		c.cost_date, 
		c.document_id, 
		c.created_at,
		v.registration_number
	FROM 
		costs c
	LEFT JOIN 
		vehicles v ON c.vehicle_id = v.id;`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resp contract.CostsResponse
	for rows.Next() {
		var cost contract.Cost
		if err := rows.Scan(
			&cost.ID,
			&cost.Value,
			&cost.Source,
			&cost.Quantity,
			&cost.VatRate,
			&cost.VatValue,
			&cost.Title,
			&cost.Currency,
			&cost.Category,
			&cost.Country,
			&cost.InvoiceDate,
			&cost.CostDate,
			&cost.DocumentID,
			&cost.CreatedAt,
			&cost.VehicleRegistrationNumber,
		); err != nil {
			return nil, err
		}
		resp = append(resp, cost)
	}

	return resp, nil
}
