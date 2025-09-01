package mappers

import (
	"frostbox/contract"
	"frostbox/logic"

	"github.com/google/uuid"
)

func MapPostEventsContractToLogic(req contract.PostVehicleEventRequest, vehicleID uuid.UUID) *logic.AddEventsWithCosts {
	events := make([]*logic.AddEventsWithCostsEvent, 0, len(req))
	for _, e := range req {
		ev := &logic.AddEventsWithCostsEvent{
			EventType:    e.EventType,
			VehicleID:    vehicleID,
			EventDate:    e.EventDate,
			EventMileage: e.Mileage,
			Costs:        mapCostsContractToDomain(e.Costs),
		}
		events = append(events, ev)
	}

	return &logic.AddEventsWithCosts{
		VehicleID: vehicleID,
		Events:    events,
	}
}

func mapCostsContractToDomain(costs []contract.EventCost) []*logic.AddEventWithCostsEventCost {
	result := make([]*logic.AddEventWithCostsEventCost, 0, len(costs))
	for _, c := range costs {
		result = append(result, &logic.AddEventWithCostsEventCost{
			Value:    c.Value,
			VATRate:  c.VatRate,
			Quantity: c.Quantity,
			Currency: c.Currency,
			Country:  c.Country,
		})
	}
	return result
}
