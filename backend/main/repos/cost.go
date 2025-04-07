package repos

import (
	"database/sql"
	"frostbox/models"
)

type CostRepo struct {
	db *sql.DB
}

func NewCostRepository(db *sql.DB) *CostRepo {
	return &CostRepo{db: db}
}

func (r *CostRepo) Insert(cost *models.Cost) error {
	query := `
        INSERT INTO costs (
            value, vat_rate, vat_value, currency, 
            value_main_currency, vat_value_main_currency, 
            quantity, vehicle_id, title, category, 
            country, invoice_date, cost_date, document_id, 
            amortization
        ) VALUES (
            $1, $2, $3, $4, $5, 
            $6, $7, $8, $9, $10, 
            $11, $12, $13, $14, 
            $15
        );`

	_, err := r.db.Exec(query,
		cost.Value,
		cost.VATRate,
		cost.VATValue,
		cost.Currency,
		cost.ValueMainCurrency,
		cost.VatValueMainCurrency,
		cost.Quantity,
		cost.VehicleID,
		cost.Title,
		cost.Category,
		cost.Country,
		cost.InvoiceDate,
		cost.CostDate,
		cost.DocumentID,
		cost.Amortization,
	)

	return err
}
