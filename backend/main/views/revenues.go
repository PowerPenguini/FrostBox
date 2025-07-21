package views

import (
	"database/sql"
	"frostbox/contract"

	"github.com/shopspring/decimal"
)

type RevenueViewer struct {
	db *sql.DB
}

func NewRevenueViewer(db *sql.DB) *RevenueViewer {
	return &RevenueViewer{db: db}
}
func (r *RevenueViewer) GetRevenues() (contract.GetRevenuesResponse, error) {
	query := `SELECT 
		r.id, 
		r.value_main_currency, 
		r.vat_value_main_currency, 
		r.vat_rate, 
		r.title, 
		r.currency, 
		r.invoice_date, 
		r.revenue_date, 
		r.created_at,
		v.registration_number,
		d.readable_id
	FROM 
		revenues r
	LEFT JOIN 
		vehicles v ON r.vehicle_id = v.id
	LEFT JOIN 
		documents d ON r.document_id = d.id;`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resp contract.GetRevenuesResponse
	for rows.Next() {
		var (
			valueMainCurrency, vatValueMainCurrency, vatRate float64
			revenue                                          contract.RevenuesResponse
		)

		if err := rows.Scan(
			&revenue.ID,
			&valueMainCurrency,
			&vatValueMainCurrency,
			&vatRate,
			&revenue.Title,
			&revenue.Currency,
			&revenue.InvoiceDate,
			&revenue.RevenueDate,
			&revenue.CreatedAt,
			&revenue.VehicleRegistrationNumber,
			&revenue.DocumentID,
		); err != nil {
			return nil, err
		}

		revenue.Value = roundUp(decimal.NewFromFloat(valueMainCurrency))
		revenue.VatValue = roundUp(decimal.NewFromFloat(vatValueMainCurrency))
		revenue.VatRate = decimal.NewFromFloat(vatRate).String()

		resp = append(resp, revenue)
	}

	return resp, nil
}
