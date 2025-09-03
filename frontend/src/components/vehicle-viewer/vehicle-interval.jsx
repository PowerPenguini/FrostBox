import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/formatting/date";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/delete-dialog";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconAlertTriangleFilled,
  IconAlertHexagonFilled,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

export function VehicleInterval({ interval, onDelete }) {
  const [open, setOpen] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case "INFO":
        return (
          <Badge className="flex items-center gap-1 bg-green-100 border-green-300 text-green-700">
            <IconCircleCheckFilled className="fill-green-600 w-3 h-3" />
            OK
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="flex items-center gap-1 bg-amber-100 border-amber-300 text-amber-700">
            <IconAlertTriangleFilled className="fill-amber-600 w-3 h-3" />
            Uwaga
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge className="flex items-center gap-1 bg-red-100 border-red-300 text-red-700">
            <IconAlertHexagonFilled className="fill-red-600 w-3 h-3" />
            Krytyczne
          </Badge>
        );
      default:
        return <Badge variant="outline">Nieznany</Badge>;
    }
  };

  return (
    <div className="group relative flex flex-col gap-4 bg-white shadow-sm hover:shadow-md pt-3 pb-5 border rounded-lg transition-all duration-300">
      <div className="flex items-center gap-2 pr-2 pl-4 font-medium">
        {getStatusBadge(interval.status)}
        <div>{interval.name}</div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 ml-auto transition-opacity duration-300">
          <Button variant="ghost" className="p-0">
            <IconEdit/>
          </Button>

          <Button
            variant="ghost"
            className="p-0 text-destructive"
            onClick={() => setOpen(true)}
          >
            <IconTrash/> 
          </Button>
        </div>
      </div>

      {/* mileage progress */}
      <div className="flex flex-col gap-2 px-4">
        <div className="flex justify-between text-gray-700 text-sm">
          <span
            className={
              interval.mileage_start !== null &&
              interval.mileage_start !== undefined
                ? "text-muted-foreground"
                : "text-gray-400"
            }
          >
            {interval.mileage_start !== null &&
            interval.mileage_start !== undefined
              ? `${interval.mileage_start} km`
              : "N/A"}
          </span>
          <span
            className={
              interval.mileage_end !== null &&
              interval.mileage_end !== undefined
                ? "text-muted-foreground"
                : "text-gray-400"
            }
          >
            {interval.mileage_end !== null && interval.mileage_end !== undefined
              ? `${interval.mileage_end} km`
              : "N/A"}
          </span>
        </div>
        <Progress
          value={
            interval.mileage_start !== undefined &&
            interval.mileage_end !== undefined &&
            interval.mileage_current !== undefined
              ? calculateMileageProgress(
                  interval.mileage_start,
                  interval.mileage_end,
                  interval.mileage_current,
                )
              : 0
          }
        />
      </div>

      {/* date progress */}
      <div className="flex flex-col gap-2 px-4">
        <div className="flex justify-between text-gray-700 text-sm">
          <span className={interval.date_start ? "text-muted-foreground" : "text-gray-400"}>
            {formatDate(interval.date_start) || "N/A"}
          </span>
          <span className={interval.date_end ? "text-muted-foreground" : "text-gray-400"}>
            {formatDate(interval.date_end) || "N/A"}
          </span>
        </div>
        <Progress
          value={
            interval.date_start && interval.date_end
              ? calculateDatePercentage(interval.date_start, interval.date_end)
              : 0
          }
        />
      </div>

      <DeleteDialog
        title="Jesteś pewny?"
        description="Usunięcie interwału jest nieodwracalne i może spowodować utratę jego stanu. Czy na pewno chcesz usunąć interwał?"
        open={open}
        onCancel={() => setOpen(false)}
        onDelete={onDelete}
      />
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
