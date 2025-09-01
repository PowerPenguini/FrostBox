import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ServiceItem } from "@/components/vehicle-viewer/service-wizard/service-item";

export function ServiceGroup({ title, items, selectedServices, toggleService }) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        {items.map((item) => (
          <ServiceItem
            key={item.id}
            title={item.title}
            description={item.description}
            checked={!!selectedServices[item.id]}
            onToggle={() => toggleService(item.id)}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
