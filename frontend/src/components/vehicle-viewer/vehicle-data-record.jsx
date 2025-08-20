import { IconHelpHexagon } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getColorClass = (rating) => {
  switch (rating) {
    case 2:
      return "bg-green-600";
    case 1:
      return "bg-yellow-600";
    case 0:
      return "bg-red-600";
  }
};

export function VehicleDataRecord({ data, unit, descrption, formula, label }) {
  const isRated = typeof data === "object" && data !== null && "value" in data && "rating" in data;
  const value = isRated ? data.value : data;

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <IconHelpHexagon className="stroke-muted-foreground w-6" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {descrption}
              <br />
              {formula}
            </p>
          </TooltipContent>
        </Tooltip>
        <span className="font-medium">{label}:</span>
      </div>
      <div className="flex items-center gap-2">
        <div>
          {value} {unit}
        </div>
        <div className={`rounded-full w-1 h-4 ${isRated ? getColorClass(data.rating) : "bg-muted-foreground"}`} />
      </div>
    </div>
  );
}
