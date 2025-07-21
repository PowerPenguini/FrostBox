"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function DatePickerFilter() {
  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState({});

  const formatDateRange = (range) => {
    if (range?.from && range?.to) {
      return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    }
    return "Wybierz datę...";
  };

  const handleSelect = (range) => {
    if (range) {
      setDateRange(range);
    } else {
      setDateRange({});
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <IconCalendar className="mr-2 w-4 h-4" />
            <span>{formatDateRange(dateRange)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto overflow-hidden" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={dateRange}
            captionLayout="dropdown"
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
