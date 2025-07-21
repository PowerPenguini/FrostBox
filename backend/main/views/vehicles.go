package views

import (
	"database/sql"
	"fmt"
	"frostbox/contract"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type VehicleViewer struct {
	db *sql.DB
}

func NewVehicleViewer(db *sql.DB) *VehicleViewer {
	return &VehicleViewer{db: db}
}

func (v *VehicleViewer) GetVehicles() (contract.GetVehiclesResponse, error) {
	query := `SELECT 
		v.id, 
		v.vin, 
		v.brand, 
		v.model, 
		v.registration_number,
		COALESCE(SUM(c.value_main_currency), 0) AS total_costs_last_30_days,
		COALESCE(SUM(c.value_main_currency) FILTER (WHERE c.category = 'toll'), 0) AS toll_costs_last_30_days,
		COALESCE(SUM(c.value_main_currency) FILTER (WHERE c.category = 'fuel'), 0) AS fuel_costs_last_30_days
	FROM 
		vehicles v
	LEFT JOIN 
		costs c ON v.id = c.vehicle_id 
		AND c.cost_date >= CURRENT_DATE - INTERVAL '120 days'
	GROUP BY 
		v.id, v.vin, v.brand, v.model, v.registration_number
	ORDER BY 
		total_costs_last_30_days DESC;
`

	rows, err := v.db.Query(query)
	if err != nil {
		log.Println("Error executing query:", err)
		return nil, err
	}
	defer rows.Close()

	var last30Cost, last30TollCost, last30FuelCost decimal.Decimal
	var resp contract.GetVehiclesResponse
	for rows.Next() {
		var vehicle contract.GetVehicle
		if err := rows.Scan(
			&vehicle.ID,
			&vehicle.VIN,
			&vehicle.Brand,
			&vehicle.Model,
			&vehicle.RegistrationNumber,
			&last30Cost,
			&last30TollCost,
			&last30FuelCost,
		); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}
		vehicle.Last30DaysCost = roundUp(last30Cost)
		vehicle.Last30DaysTollCost = roundUp(last30TollCost)
		vehicle.Last30DaysFuelCost = roundUp(last30FuelCost)
		resp = append(resp, vehicle)
	}

	if err := rows.Err(); err != nil {
		log.Println("Error during rows iteration:", err)
		return nil, err
	}

	return resp, nil
}

func (v *VehicleViewer) GetVehiclesAvailable() (contract.GetVehiclesAvailableResponse, error) {
	query := `SELECT 
		id, 
		brand, 
		model, 
		registration_number
	FROM 
		vehicles;
	`
	rows, err := v.db.Query(query)
	if err != nil {
		log.Println("Error executing query:", err)
		return nil, err
	}
	defer rows.Close()

	var resp contract.GetVehiclesAvailableResponse
	for rows.Next() {
		var vehicle contract.GetVehicleAvailable
		if err := rows.Scan(
			&vehicle.ID,
			&vehicle.Brand,
			&vehicle.Model,
			&vehicle.RegistrationNumber,
		); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}
		resp = append(resp, vehicle)
	}

	if err := rows.Err(); err != nil {
		log.Println("Error during rows iteration:", err)
		return nil, err
	}

	return resp, nil
}

func (v *VehicleViewer) GetVehicleStatistics(vehicleID uuid.UUID, startDate, endDate time.Time) (contract.GetVehicleStatistics, error) {
	query := `SELECT
		country,
		SUM(value_main_currency) AS total_toll
	FROM
		costs
	WHERE
		vehicle_id = $1
		AND category = 'toll'
		AND cost_date BETWEEN $2 AND $3
	GROUP BY
		country
	ORDER BY
		country;`

	rows, err := v.db.Query(query, vehicleID, startDate, endDate)
	if err != nil {
		log.Println("Error executing toll query:", err)
		return contract.GetVehicleStatistics{}, err
	}
	defer rows.Close()

	distribution := make(map[string]decimal.Decimal)
	var total decimal.Decimal

	for rows.Next() {
		var country string
		var toll decimal.Decimal
		if err := rows.Scan(&country, &toll); err != nil {
			log.Println("Error scanning row:", err)
			return contract.GetVehicleStatistics{}, err
		}
		distribution[country] = toll
		total = total.Add(toll)
	}

	if err := rows.Err(); err != nil {
		log.Println("Error during rows iteration:", err)
		return contract.GetVehicleStatistics{}, err
	}

	result := make(map[string]contract.CountryTollSum)
	for country, sum := range distribution {
		percentage := decimal.Zero
		if !total.IsZero() {
			percentage = sum.Div(total).Mul(decimal.NewFromInt(100))
		}
		result[country] = contract.CountryTollSum{
			TollDistributionMainCurrency: sum,
			TollDistributionPercentage:   percentage.Round(2),
		}
	}

	return contract.GetVehicleStatistics{
		TollCountryDistribution: result,
	}, nil
}

func (v *VehicleViewer) GetVehiclesTolls(vehicleID uuid.UUID, startDate, endDate time.Time) (contract.GetVehiclesTolls, error) {
	const statsQuery = `
		WITH 
			totals AS (
				SELECT 
					SUM(CASE WHEN category = 'toll' THEN value_main_currency ELSE 0 END) AS total_toll,
					COUNT(CASE WHEN category = 'toll' THEN 1 END) AS toll_count,
					SUM(value_main_currency) AS total_costs
				FROM costs
				WHERE vehicle_id = $1
				AND cost_date BETWEEN $2 AND $3
			),
			revenue_sum AS (
				SELECT SUM(value_main_currency) AS total_revenue
				FROM revenues
				WHERE vehicle_id = $1
				AND revenue_date BETWEEN $2 AND $3
			)

		SELECT
			COALESCE(t.total_toll, 0) AS total_toll,
			ROUND((COALESCE(t.total_toll, 0) / NULLIF(t.total_costs, 0)) * 100, 2) AS toll_percent_in_costs,
			ROUND((COALESCE(t.total_toll, 0) / NULLIF(r.total_revenue, 0)) * 100, 2) AS toll_percent_in_revenue,
			ROUND((COALESCE(r.total_revenue, 0) / NULLIF(t.total_toll, 0)), 2) AS revenue_per_toll_unit,
			ROUND(r.total_revenue - COALESCE(t.total_toll, 0), 2) AS revenue_minus_toll,
			ROUND(((r.total_revenue - COALESCE(t.total_toll, 0)) / NULLIF(r.total_revenue, 0)) * 100, 2) AS efficiency_after_toll,
			ROUND(COALESCE(t.total_toll, 0) / NULLIF(t.toll_count, 0), 2) AS avg_toll_cost
		FROM totals t, revenue_sum r;
	`

	const byCountryQuery = `
		WITH total_toll AS (
		SELECT 
			COALESCE(SUM(value_main_currency), 0) AS total
		FROM costs
		WHERE vehicle_id = $1
			AND category = 'toll'
			AND cost_date BETWEEN $2 AND $3
		)
		SELECT 
		c.country,
		COALESCE(SUM(c.value_main_currency), 0) AS total_toll,
		ROUND(
			(COALESCE(SUM(c.value_main_currency), 0) / NULLIF(tt.total, 0)) * 100, 2
		) AS toll_percentage_of_total
		FROM costs c
		CROSS JOIN total_toll tt
		WHERE c.vehicle_id = $1
		AND c.category = 'toll'
		AND c.cost_date BETWEEN $2 AND $3
		GROUP BY c.country, tt.total
		ORDER BY c.country;

	`
	var result contract.GetVehiclesTolls

	row := v.db.QueryRow(statsQuery, vehicleID, startDate, endDate)
	err := row.Scan(
		&result.TotalTollMainCurrency,
		&result.TollPercentInCost,
		&result.TollPercentInRevenue,
		&result.RevenuePerTollUnit,
		&result.RevenueAfterTolls,
		&result.EfficiencyAfterToll,
		&result.AvgTollCost,
	)
	if err != nil {
		return contract.GetVehiclesTolls{}, fmt.Errorf("scan stats: %w", err)
	}

	rows, err := v.db.Query(byCountryQuery, vehicleID, startDate, endDate)
	if err != nil {
		return contract.GetVehiclesTolls{}, fmt.Errorf("query tolls by country: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]contract.CountryTollSum)
	for rows.Next() {
		var country string
		var tollSum decimal.Decimal
		var tollPercent decimal.Decimal
		if err := rows.Scan(&country, &tollSum, &tollPercent); err != nil {
			return contract.GetVehiclesTolls{}, fmt.Errorf("scan toll by country: %w", err)
		}
		distribution[country] = contract.CountryTollSum{
			TollDistributionMainCurrency: tollSum.RoundCeil(2),
			TollDistributionPercentage:   tollPercent.RoundCeil(2),
		}
	}

	if err := rows.Err(); err != nil {
		return contract.GetVehiclesTolls{}, fmt.Errorf("iterate toll rows: %w", err)
	}

	result.VehicleID = vehicleID
	result.Period = contract.TollPeriod{From: startDate, To: endDate}
	result.CountryDistribution = distribution
	result.TotalTollMainCurrency = result.TotalTollMainCurrency.RoundCeil(2)
	return result, nil
}
