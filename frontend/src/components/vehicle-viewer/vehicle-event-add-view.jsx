import { Button } from "@/components/ui/button";
import { useVehicleViewer } from "@/state/vehicle-viewer-context";
import {
  IconHeartCog,
  IconEngineOff,
  IconAlertTriangle,
  IconDots,
  IconFileText,
  IconBucketDroplet,
} from "@tabler/icons-react";
export function VehicleEventAddView({ vehicleId }) {
  return (
    <div className="flex flex-col flex-1 gap-4 px-4 pb-4">
      <div className="flex items-center font-medium text-lg">
        Wybierz typ zdarzenia
      </div>
      <div className="flex-1 gap-4 grid grid-cols-3 grid-rows-2">
        <EventButton text="Serwis okresowy" number={1} icon={IconHeartCog} />
        <EventButton text="Serwis awaryjny" number={2} icon={IconEngineOff} />
        <EventButton
          text="Zdarzenie drogowe"
          number={3}
          icon={IconAlertTriangle}
          disabled
        />
        <EventButton
          text="Zdarzenia administracyjne"
          number={4}
          icon={IconFileText}
          disabled
        />
        <EventButton
          text="Zdarzenia gospodarcze"
          number={5}
          icon={IconBucketDroplet}
          disabled
        />
        <EventButton
          text="Inne zdarzenie"
          number={6}
          icon={IconDots}
          disabled
        />
      </div>
    </div>
  );
}

export function EventButton({ text, number, icon: Icon, disabled }) {
  const { push } = useVehicleViewer();
  return (
    <Button
      disabled={disabled}
      className="relative flex flex-col gap-2 h-full overflow-hidden text-xl"
      variant="outline"
      onClick={() => push(text)}
    >
      <Icon className="z-1 size-16" />
      <div className="z-1 w-full text-center whitespace-normal">{text}</div>
      <div className="right-0 bottom-0 absolute font-mono text-muted text-9xl">
        {number.toString().padStart(2, "0")}
      </div>
    </Button>
  );
}
