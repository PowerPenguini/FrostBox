package logic

import (
	"frostbox/di"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AddEventWithCostsEventCost struct {
	Value    decimal.Decimal
	VATRate  decimal.Decimal
	Quantity decimal.Decimal
	Currency string
	Country  string
}
type AddEventWithCosts struct {
	EventDate    time.Time
	EventMileage int
	EventType    uuid.UUID
	VehicleID    *uuid.UUID
	Costs        []*AddEventWithCostsEventCost
}

func (p *AddEventWithCosts) Execute(deps *di.DI) error {
	return di.ExecuteInTransactionNoResult(deps, func(txDI *di.DI) error {
		eventType, err := txDI.EventTypeRepo.GetEventType(p.EventType)
		if err != nil {
			return err
		}

		event := &models.Event{
			VehicleID:    *p.VehicleID,
			EventTypeID:  p.EventType,
			EventDate:    p.EventDate,
			EventMileage: &p.EventMileage,
		}

		if err := deps.EventValidator.ValidateModel(event); err != nil {
			return err
		}

		for _, c := range p.Costs {
			act := &AddCost{
				Value:        &c.Value,
				VATRate:      &c.VATRate,
				Currency:     &c.Currency,
				Quantity:     c.Quantity,
				VehicleID:    p.VehicleID,
				Title:        eventType.Name,
				Category:     eventType.DefaultCostCategory,
				InvoiceDate:  p.EventDate,
				CostDate:     p.EventDate,
				Amortization: 1,
				Country:      "PL",
			}
			_, err := act.Execute(txDI)
			if err != nil {
				return err
			}
		}

		return txDI.EventRepo.AddEvent(event)
	})
}
