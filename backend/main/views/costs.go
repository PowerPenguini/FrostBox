package views

import (
	"database/sql"
	"frostbox/contract"

	"github.com/shopspring/decimal"
)

type CostViewer struct {
	db *sql.DB
}

func NewCostViewer(db *sql.DB) *CostViewer {
	return &CostViewer{db: db}
}

func (r *CostViewer) GetCosts() (contract.GetCostsResponse, error) {
	query := `SELECT 
		c.id, 
		c.value_main_currency, 
		c.quantity, 
		c.vat_rate, 
		c.vat_value_main_currency, 
		c.title, 
		c.currency, 
		c.category, 
		c.country, 
		c.invoice_date, 
		c.cost_date, 
		d.readable_id,
		c.created_at,
		v.registration_number
	FROM 
		costs c
	LEFT JOIN 
		vehicles v ON c.vehicle_id = v.id
	LEFT JOIN 
    	documents d ON c.document_id = d.id;`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var value, quantity, vatRate, vatValue float64
	var resp contract.GetCostsResponse
	for rows.Next() {
		var cost contract.CostResponse
		if err := rows.Scan(
			&cost.ID,
			&value,
			&quantity,
			&vatRate,
			&vatValue,
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

		cost.Value = roundUp(decimal.NewFromFloat(value))
		cost.Quantity = decimal.NewFromFloat(quantity).String()
		cost.VatRate = decimal.NewFromFloat(vatRate).String()
		cost.VatValue = roundUp(decimal.NewFromFloat(vatValue))
		resp = append(resp, cost)
	}

	return resp, nil
}

func (r *CostViewer) GetCostsCategories() (contract.GetCostsCategoryResponse, error) {
	query := `SELECT e.enumlabel
		FROM pg_enum e
		JOIN pg_type t ON e.enumtypid = t.oid
		WHERE t.typname = 'cost_category';
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var t string
	var resp contract.GetCostsCategoryResponse
	for rows.Next() {
		if err := rows.Scan(
			&t,
		); err != nil {
			return nil, err
		}
		resp = append(resp, t)
	}

	return resp, nil
}
