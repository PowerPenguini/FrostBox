package logic

import (
	"frostbox/di"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AddEventsWithCosts struct {
	VehicleID uuid.UUID
	Events    []*AddEventsWithCostsEvent
}

type AddEventsWithCostsEvent struct {
	EventType    uuid.UUID
	VehicleID    uuid.UUID
	EventDate    time.Time
	EventMileage int
	Costs        []*AddEventWithCostsEventCost
}

type AddEventWithCostsEventCost struct {
	Value    decimal.Decimal
	VATRate  decimal.Decimal
	Quantity decimal.Decimal
	Category string
	Currency string
	Country  string
}

func (p *AddEventsWithCosts) Execute(deps *di.DI) error {
	return di.ExecuteInTransactionNoResult(deps, func(txDI *di.DI) error {
		for _, ev := range p.Events {
			eventType, err := txDI.EventTypeRepo.GetEventType(ev.EventType)
			if err != nil {
				return err
			}

			event := &models.Event{
				VehicleID:    ev.VehicleID,
				EventTypeID:  ev.EventType,
				EventDate:    ev.EventDate,
				EventMileage: &ev.EventMileage,
			}

			if err := deps.EventValidator.ValidateModel(event); err != nil {
				return err
			}

			for _, c := range ev.Costs {
				act := &AddCost{
					Value:        &c.Value,
					VATRate:      &c.VATRate,
					Currency:     &c.Currency,
					Quantity:     c.Quantity,
					VehicleID:    &ev.VehicleID,
					Title:        eventType.Name,
					Category:     c.Category,
					InvoiceDate:  ev.EventDate,
					CostDate:     ev.EventDate,
					Amortization: 1,
					Country:      "PL",
				}

				if _, err := act.Execute(txDI); err != nil {
					return err
				}
			}

			if err := txDI.EventRepo.AddEvent(event); err != nil {
				return err
			}
		}

		return nil
	})
}
