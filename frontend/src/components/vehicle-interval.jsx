import {
  IconCircleCheckFilled,
  IconAlertTriangleFilled,
  IconAlertHexagonFilled,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/formatting/date";
import { Button } from "./ui/button";

export function VehicleInterval({ interval, onDelete }) {
  return (
    <div className="group relative flex flex-col gap-4 pt-2 pb-4 border rounded-lg">
      <div className="flex items-center gap-2 pr-2 pl-4 font-medium">
        {(() => {
          switch (interval.status) {
            case "INFO":
              return (
                <IconCircleCheckFilled className="fill-green-500 w-4 shrink-0" />
              );
            case "WARNING":
              return (
                <IconAlertTriangleFilled className="fill-amber-500 w-4 shrink-0" />
              );
            case "CRITICAL":
              return (
                <IconAlertHexagonFilled className="fill-red-500 w-4 shrink-0" />
              );
            default:
              return null;
          }
        })()}
        <div>{interval.name}</div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 ml-auto transition-opacity duration-300">
          <Button variant="ghost" className="p-0">
            <IconEdit />
          </Button>
          <Button variant="ghost" className="p-0 text-destructive" onClick={() => onDelete(interval.id)}> 
            <IconTrash />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div className="flex justify-between">
          <div
            className={
              interval.mileage_start !== null &&
              interval.mileage_start !== undefined
                ? ""
                : "text-gray-500"
            }
          >
            {interval.mileage_start !== null &&
            interval.mileage_start !== undefined
              ? `${interval.mileage_start} km`
              : "N/A"}
          </div>
          <div
            className={
              interval.mileage_end !== null &&
              interval.mileage_end !== undefined
                ? ""
                : "text-gray-500"
            }
          >
            {interval.mileage_end !== null && interval.mileage_end !== undefined
              ? `${interval.mileage_end} km`
              : "N/A"}
          </div>
        </div>
        <Progress
          value={
            interval.mileage_start !== undefined &&
            interval.mileage_end !== undefined &&
            interval.mileage_current !== undefined
              ? calculateMileageProgress(
                  interval.mileage_start,
                  interval.mileage_end,
                  interval.mileage_current
                )
              : 0
          }
        />
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div className="flex justify-between">
          <div className={interval.date_start ? "" : "text-gray-500"}>
            {formatDate(interval.date_start) || "N/A"}
          </div>
          <div className={interval.date_end ? "" : "text-gray-500"}>
            {formatDate(interval.date_end) || "N/A"}
          </div>
        </div>
        <Progress
          value={
            interval.date_start && interval.date_end
              ? calculateDatePercentage(interval.date_start, interval.date_end)
              : 0
          }
        />
      </div>
    </div>
  );
}

function calculateDatePercentage(startDate, endDate) {
  const today = new Date();

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end) || start >= end) {
    return 0;
  }
  const totalDuration = end - start;
  const elapsedTime = today - start;
  const percentage = (elapsedTime / totalDuration) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

function calculateMileageProgress(startValue, endValue, currentValue) {
  if (startValue >= endValue) {
    throw new Error("Invalid mileage data!");
  }

  const totalProgress = endValue - startValue;
  const achievedProgress = currentValue - startValue;
  const percentage = (achievedProgress / totalProgress) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}
