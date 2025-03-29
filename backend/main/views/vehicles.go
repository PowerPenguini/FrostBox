package views

import (
	"database/sql"
	"frostbox/contract"
	"log"
)

type VehicleViewer struct {
	db *sql.DB
}

func NewVehicleViewer(db *sql.DB) *VehicleViewer {
	return &VehicleViewer{db: db}
}

func (v *VehicleViewer) GetVehicles() (contract.VehiclesResponse, error) {
	query := `SELECT 
		id,
		vin, 
		brand, 
		model, 
		registration_number
	FROM vehicles;`

	rows, err := v.db.Query(query)
	if err != nil {
		log.Println("Error executing query:", err)
		return nil, err
	}
	defer rows.Close()

	var resp contract.VehiclesResponse
	for rows.Next() {
		var vehicle contract.Vehicle
		if err := rows.Scan(
			&vehicle.ID,
			&vehicle.VIN,
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
