import { Button } from "@/components/ui/button";
import { useVehicleViewer } from "@/state/vehicle-viewer-context";
import {
  IconHeartCog,
  IconEngineOff,
  IconAlertTriangle,
  IconDots,
} from "@tabler/icons-react";
export function VehicleEventAddView({ vehicleId }) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center font-medium text-lg">
        Wybierz typ zdarzenia
      </div>
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4">
        <EventButton text="Serwis okresowy" number={1} icon={IconHeartCog} />
        <EventButton text="Serwis awaryjny" number={2} icon={IconEngineOff} />
        <EventButton
          text="Zdarzenie drogowe"
          number={3}
          icon={IconAlertTriangle}
        />
        <EventButton text="Inne zdarzenie" number={4} icon={IconDots} />
      </div>
    </div>
  );
}

export function EventButton({ text, number, icon: Icon }) {
  const { push } = useVehicleViewer();
  return (
    <Button
      className="overflow-hidden flex flex-col gap-2 h-full text-xl relative"
      variant="outline"
      onClick={() => push(text)}
    >
      <Icon className="size-16 z-1" />
      <div className="z-1">{text}</div>
      <div className="absolute text-9xl font-mono text-muted bottom-0 right-0">
        {number.toString().padStart(2, "0")}
      </div>
    </Button>
  );
}
