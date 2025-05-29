"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const currencies = [
  { code: "PLN", name: "Polski złoty" },
  { code: "EUR", name: "Euro" },
  {code: "CHF", name: "Frank szwajcarski"},
  { code: "USD", name: "Dolar amerykański" },
  { code: "GBP", name: "Funt szteling" },
  { code: "JPY", name: "Jen" },
  { code: "HUF", name: "Forint" },
  {code:"DKK", name: "Korona duńska"},
  {code:"NOK", name: "Korona norweska"},
  {code:"UAH", name: "Hrywna"},
  {code:"CZK", name: "Korona czeska"}
];
export function CurrencyCombox({ id, value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={id}
          className="justify-between"
          disabled={disabled}
        >
          {value
            ? currencies.find((currency) => currency.code === value)?.code
            : "Wybierz walutę..."}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]">
          <Command id={id}>
            <CommandInput placeholder="Wyszukaj walutę..." />
            <CommandList>
              <CommandEmpty>Nie znaleziono walut</CommandEmpty>
              <CommandGroup>
                {currencies.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    value={currency.code}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === currency.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {currency.code}{" "}
                    <span className="text-muted-foreground">
                      | {currency.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
