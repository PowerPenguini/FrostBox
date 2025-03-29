package contract

type VehiclesResponse []Vehicle

type Vehicle struct {
	ID                 string `json:"id"`
	VIN                string `json:"vin"`
	Brand              string `json:"brand"`
	Model              string `json:"model"`
	RegistrationNumber string `json:"registration_number"`
}
