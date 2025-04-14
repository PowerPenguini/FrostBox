package contract

type GetVehiclesResponse []GetVehicle

type GetVehiclesAvailableResponse []GetVehicleAvailable

type GetVehicle struct {
	ID                 string `json:"id"`
	VIN                string `json:"vin"`
	Brand              string `json:"brand"`
	Model              string `json:"model"`
	RegistrationNumber string `json:"registration_number"`
	Last30DaysCost     string `json:"last_30_days_cost"`
	Last30DaysTollCost string `json:"last_30_days_toll_cost"`
	Last30DaysFuelCost string `json:"last_30_days_fuel_cost"`
}

type GetVehicleAvailable struct {
	ID                 string `json:"id"`
	Brand              string `json:"brand"`
	Model              string `json:"model"`
	RegistrationNumber string `json:"registration_number"`
}

type PostVehicleRequest struct {
	VIN                string `json:"vin"`
	Brand              string `json:"brand"`
	Model              string `json:"model"`
	RegistrationNumber string `json:"registration_number"`
}
