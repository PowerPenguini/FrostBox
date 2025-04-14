package repos

import (
	"database/sql"
	"frostbox/models"
)

type VehicleRepo struct {
	db *sql.DB
}

func NewVehicleRepository(db *sql.DB) *VehicleRepo {
	return &VehicleRepo{db: db}
}

func (r *VehicleRepo) Insert(vehicle *models.Vehicle) error {
	query := `
        INSERT INTO vehicles (
            vin, brand, model, registration_number
        ) VALUES (
            $1, $2, $3, $4
        );`

	_, err := r.db.Exec(query,
		vehicle.VIN,
		vehicle.Brand,
		vehicle.Model,
		vehicle.RegistrationNumber,
	)

	return err
}
