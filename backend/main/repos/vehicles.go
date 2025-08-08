package repos

import (
	"frostbox/models"

	"github.com/google/uuid"
)

type VehicleRepo struct {
	db DBTX
}

func NewVehicleRepository(db DBTX) *VehicleRepo {
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

func (r *VehicleRepo) Exists(vehicleID uuid.UUID) (bool, error) {
	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM vehicles WHERE id = $1)`
	err := r.db.QueryRow(query, vehicleID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
