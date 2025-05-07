import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  IconCircleCheckFilled,
  IconAlertTriangleFilled,
  IconAlertHexagonFilled,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/state/auth-context";
import { formatDate } from "@/formatting/date";
import { EventList } from "./event-list";
import { Spinner } from "./spinner";
import { ErrorText } from "@/components/error-text";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },

  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
};

export function VehicleCellViewer({ item }) {
  const isMobile = useIsMobile();
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useAuthContext();

  useEffect(() => {
    if (!open) return;
    async function fetchIntervals() {
      try {
        const response = await fetch(`/api/v1/vehicles/${item.id}/intervals`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch intervals");
        }
        const data = await response.json();
        setIntervals(data);
      } catch (error) {
        console.error("Error fetching intervals:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchIntervals();
  }, [open, item.id]);
  const dialogMobile = (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 w-fit text-foreground text-left">
          {item.registration_number}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Pojazd</DrawerTitle>
          <DrawerDescription>
            Showing total visitors for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 overflow-y-auto text-sm"></div>
      </DrawerContent>
    </Drawer>
  );
  const dialogDesktop = (
    <Dialog open={open} onOpenChange={setOpen} direction="bottom">
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 w-fit text-foreground text-left">
          {item.registration_number}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex gap-0 p-0 md:max-w-7/8 h-7/8 max-h-[800px]">
        <div className="flex flex-col gap-6 p-6 w-2/3">
          <DialogHeader className="gap-1">
            <DialogTitle>Pojazd</DialogTitle>
            <DialogDescription>Rozszerzone dane o pojeździe</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 overflow-y-auto text-sm">
            <div className="flex items-center gap-4 font-medium text-lg">
              Interwały
              <Button className="text-sm" variant="outline">
                <IconPlus />
                Dodaj interwał
              </Button>
            </div>
            <div className="gap-4 grid grid-cols-3">
              {loading ? (
                <div className="place-items-center grid col-span-3 p-4 w-full">
                  <Spinner />
                </div>
              ) : error ? (
                <ErrorText text={error} />
              ) : intervals.length > 0 ? (
                intervals.map((interval) => (
                  <VehicleInterval
                    key={interval.id}
                    interval={interval}
                  />
                ))
              ) : (
                <div className="text-muted-foreground">
                  Brak zdefiniowanych interwałów.
                </div>
              )}
            </div>
          </div>
        </div>
        {open && <EventList vehicleId={item.id} />}
      </DialogContent>
    </Dialog>
  );

  return isMobile ? dialogMobile : dialogDesktop;
}

function VehicleInterval({
  interval
}) {
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
          <Button variant="ghost" className="p-0 text-destructive">
            <IconTrash />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div className="flex justify-between">
          <div className={interval.mileage_start !== undefined ? "" : "text-gray-500"}>
            {interval.mileage_start !== undefined ? `${interval.mileage_start} km` : "N/A"}
          </div>
          <div className={interval.mileage_end !== undefined ? "" : "text-gray-500"}>
            {interval.mileage_end !== undefined ? `${interval.mileage_end} km` : "N/A"}
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
