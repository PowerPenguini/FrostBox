package views

import (
	"database/sql"
	"frostbox/contract"
	"log"

	"github.com/shopspring/decimal"
)

type VehicleViewer struct {
	db *sql.DB
}

func NewVehicleViewer(db *sql.DB) *VehicleViewer {
	return &VehicleViewer{db: db}
}

func (v *VehicleViewer) GetVehicles() (contract.VehiclesResponse, error) {
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
	var resp contract.VehiclesResponse
	for rows.Next() {
		var vehicle contract.Vehicle
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

func (v *VehicleViewer) GetVehiclesAvailable() (contract.VehiclesAvailableResponse, error) {
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

	var resp contract.VehiclesAvailableResponse
	for rows.Next() {
		var vehicle contract.VehicleAvailable
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
