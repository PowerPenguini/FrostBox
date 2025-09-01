import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ErrorText } from "@/components/error-text";
import { ServiceGroup } from "@/components/vehicle-viewer/service-wizard/service-group";
import { Spinner } from "@/components/spinner";
import { useEffect } from "react";
import { getAreaLabel } from "@/formatting/area";
import { useEventTypes } from "@/state/event-types-context";

export function ServiceSelectionStep({
  selectedServices,
  toggleService,
  category,
  error,
  errorRef,
}) {
  const {
    loading,
    eventTypes,
    error: fetchError,
    fetchEventTypes,
  } = useEventTypes();
  useEffect(() => {
    fetchEventTypes();
  }, []);

  const groupsMap = eventTypes
    .filter((ev) => !category || ev.category === category)
    .reduce((acc, ev) => {
      if (!acc[ev.component_area]) {
        acc[ev.component_area] = [];
      }
      acc[ev.component_area].push(ev);
      return acc;
    }, {});

  const serviceGroups = Object.entries(groupsMap).map(([area, items]) => ({
    title: getAreaLabel(area),
    items: items.map((ev) => ({
      id: ev.id,
      title: ev.name,
      description: ev.description,
    })),
  }));
  if (loading) {
    return <Spinner />;
  }

  if (fetchError) {
    return (
      <ErrorText
        text={`Nie udało się pobrać danych. Spróbuj ponownie później.`}
      />
    );
  }

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        {serviceGroups.map((group) => (
          <ServiceGroup
            key={group.title}
            {...group}
            selectedServices={selectedServices}
            toggleService={toggleService}
          />
        ))}
      </Accordion>
      {error && (
        <div className="py-4" ref={errorRef}>
          <ErrorText text={error} />
        </div>
      )}
    </>
  );
}
