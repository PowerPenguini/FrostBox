import { VehicleServiceStepper } from "./vehicle-service-stepper";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "../ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

const serviceGroups = [
  {
    title: "Silnik i układ smarowania",
    items: [
      {
        title: "Wymiana oleju i filtra oleju",
        description:
          "Zmniejszenie ryzyka awarii i wydłużenie żywotności silnika dzięki wymianie oleju.",
      },
      { title: "Kalibracja układu wtryskowego", description: "" },
      {
        title: "Wymiana filtra powietrza",
        description:
          "Zapewnienie optymalnej pracy silnika i niższego zużycia paliwa dzięki wymianie filtra powietrza.",
      },
    ],
  },
  {
    title: "Układ hamulcowy",
    items: [
      {
        title: "Wymiana klocków hamulcowych",
        description:
          "Minimalizacja przestojów i zwiększenie bezpieczeństwa floty dzięki wymianie klocków hamulcowych.",
      },
    ],
  },
  {
    title: "Układ napędowy",
    items: [
      {
        title: "Kalibracja mechatroniki skrzyni biegów",
        description:
          "Zwiększenie niezawodności i ograniczenie przestojów floty dzięki kalibracji mechatroniki skrzyni biegów",
      },
      {
        title: "Wymiana oleju w skrzyni biegów",
        description:
          "Zabezpieczenie płynnej pracy skrzyni biegów i przedłużenie jej żywotności dzięki wymianie oleju.",
      },
      {
        title: "Wymiana oleju w mostach",
        description:
          "Zapewnienie niezawodnej pracy napędu i ochrony przekładni dzięki wymianie oleju w mostach.",
      },
    ],
  },
  {
    title: "Kabina i wyposażenie",
    items: [
      {
        title: "Wymiana filtra kabinowego",
        description:
          "Poprawia jakość powietrza w kabinie, poprawia komfort pracy kierowcy",
      },
    ],
  },
];

export function VehicleServiceEventWizard() {
  return (
    <div className="flex flex-col flex-1 gap-4" style={{ minHeight: 0 }}>
      <div className="p-4">
        <VehicleServiceStepper
          steps={[
            "Informacje",
            "Zakres serwisu",
            "Koszty serwisu",
            "Podsumowanie",
          ]}
          currentStep={1}
        />
      </div>

      <div className="flex-1 min-h-0">
        <div className="w-full h-full overflow-x-hidden overflow-y-auto">
          <div className="min-h-0">
            <Accordion type="single" collapsible className="px-4 w-full">
              {serviceGroups.map((group) => (
                <ServiceGroup key={group.title} {...group} />
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2 p-4">
        <Button variant="outline">Anuluj</Button>
        <Button>Dalej</Button>
      </div>
    </div>
  );
}

export function ServiceGroup({ title, items }) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance">
        {items.map((item) => (
          <ServiceItem
            key={item.title}
            title={item.title}
            description={item.description}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

export function ServiceItem({ title, description }) {
  return (
    <Label className="flex items-start gap-3 has-[[aria-checked=true]]:bg-blue-50 hover:bg-accent/50 dark:has-[[aria-checked=true]]:bg-blue-950 p-3 border has-[[aria-checked=true]]:border-blue-600 dark:has-[[aria-checked=true]]:border-blue-900 rounded-lg">
      <Checkbox
        id={title}
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-blue-700 data-[state=checked]:text-white"
      />
      <div className="gap-1.5 grid font-normal">
        <p className="font-medium text-sm leading-none">{title}</p>
        <p className="text-muted-foreground text-sm">{description || ""}</p>
      </div>
    </Label>
  );
}
