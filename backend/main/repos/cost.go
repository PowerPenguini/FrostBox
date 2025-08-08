package repos

import (
	"frostbox/models"

	"github.com/google/uuid"
)

type CostRepo struct {
	db DBTX
}

func NewCostRepository(db DBTX) *CostRepo {
	return &CostRepo{db: db}
}

func (r *CostRepo) Insert(cost *models.Cost) (*uuid.UUID, error) {
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
        )
        RETURNING id;`

	var id uuid.UUID
	err := r.db.QueryRow(query,
		cost.Value,
		cost.VATRate,
		cost.VATValue,
		cost.Currency,
		cost.ValueMainCurrency,
		cost.VATValueMainCurrency,
		cost.Quantity,
		cost.VehicleID,
		cost.Title,
		cost.Category,
		cost.Country,
		cost.InvoiceDate,
		cost.CostDate,
		cost.DocumentID,
		cost.Amortization,
	).Scan(&id)

	return &id, err
}

func (r *CostRepo) Exists(costID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM costs
			WHERE id = $1
		);`

	var exists bool
	err := r.db.QueryRow(query, costID).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}
