import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { IconBasketDollar, IconReceipt2 } from "@tabler/icons-react";
import { AddCostRow } from "@/components/vehicle-viewer/service-wizard/add-cost-row";
import { FinalizedCostRow } from "@/components/vehicle-viewer/service-wizard/finalized-cost-row";
import { ErrorText } from "@/components/error-text";
import { useEventTypes } from "@/state/event-types-context";

export function CostsStep({
  selectedServices,
  costs,
  addCost,
  updateCost,
  finalizeCost,
  cancelEdit,
  deleteCost,
  startEditingCost,
  editingCostRow,
  error,
}) {
  const { idToTitleMap } = useEventTypes();
  const isEditing = (serviceId, index) =>
    editingCostRow === `${serviceId}-${index}`;
  const firstOpen = Object.keys(selectedServices).filter(
    (s) => selectedServices[s]
  )[0];

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={firstOpen}
      >
        {Object.keys(selectedServices)
          .filter((s) => selectedServices[s])
          .map((serviceId) => (
            <AccordionItem key={serviceId} value={serviceId}>
              <AccordionTrigger>{idToTitleMap[serviceId]}</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                {(costs[serviceId] || []).map((c, i) =>
                  isEditing(serviceId, i) ? (
                    <AddCostRow
                      key={`${serviceId}-${i}`}
                      serviceId={serviceId}
                      index={i}
                      cost={c}
                      updateCost={updateCost}
                      onOk={() => finalizeCost(serviceId)}
                      onCancel={() => cancelEdit(serviceId, i)}
                    />
                  ) : (
                    <FinalizedCostRow
                      key={`${serviceId}-${i}`}
                      serviceId={serviceId}
                      index={i}
                      cost={c}
                      onDelete={deleteCost}
                      onEdit={startEditingCost}
                    />
                  )
                )}
                <div className="gap-4 grid grid-cols-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCost(serviceId, idToTitleMap[serviceId])}
                    disabled={Object.keys(costs).some((s) =>
                      (costs[s] || []).some((_, idx) => isEditing(s, idx))
                    )}
                  >
                    <IconBasketDollar /> Dodaj koszt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCost(serviceId)}
                    disabled
                  >
                    <IconReceipt2 />
                    Dodaj fakturę
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
      {error && <ErrorText text={error} />}
    </>
  );
}
