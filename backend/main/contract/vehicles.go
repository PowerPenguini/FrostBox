package contract

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type GetVehiclesResponse []GetVehicle

type GetVehiclesAvailableResponse []GetVehicleAvailable

type GetVehiclesCategoryResponse []string // TODO: implement

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

type CountryTollSum struct {
	TollDistributionMainCurrency decimal.Decimal `json:"toll_distribution_main_currency"`
	TollDistributionPercentage   decimal.Decimal `json:"toll_distribution_percentage"`
}

type TollPeriod struct {
	From time.Time `json:"from"`
	To   time.Time `json:"to"`
}

type GetVehiclesTolls struct {
	VehicleID             uuid.UUID                 `json:"vehicle_id"`
	Period                TollPeriod                `json:"period"`
	TotalTollMainCurrency decimal.Decimal           `json:"total_toll_main_currency"`
	TollPercentInCost     decimal.Decimal           `json:"toll_percent_in_cost"`
	TollPercentInRevenue  decimal.Decimal           `json:"toll_percent_in_revenue"`
	RevenuePerTollUnit    decimal.Decimal           `json:"revenue_per_toll_unit"`
	EfficiencyAfterToll   decimal.Decimal           `json:"efficiency_after_toll"`
	AvgTollCost           decimal.Decimal           `json:"avg_toll_cost"`
	RevenueAfterTolls     decimal.Decimal           `json:"revenue_after_tolls"`
	CountryDistribution   map[string]CountryTollSum `json:"country_distribution"`
}

type GetVehicleStatistics struct {
	TollCountryDistribution map[string]CountryTollSum `json:"toll_country_distribution"`
}
