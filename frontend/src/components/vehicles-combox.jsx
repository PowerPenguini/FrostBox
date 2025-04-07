"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useAuthContext } from "@/state/auth-context";



export function VehiclesCombox({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/v1/vehicles/available", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Sieć niedostępna");
        }
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={id}
          className="justify-between"
        >
          {value
            ? vehicles.find((vehicle) => vehicle.id === value)
                ?.registration_number
            : "Wybierz pojazd..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]">
        <Command
          id={id}
          filter={(val, search) => {
            const vehicle = vehicles.find((v) => v.id === val);
            return vehicle
              ? vehicle.registration_number
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : false;
          }}
        >
          <CommandInput placeholder="Wyszukaj pojazd..." />
          <CommandList>
            <CommandEmpty>Nie znaleziono pojazdów</CommandEmpty>
            <CommandGroup>
              {vehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={vehicle.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === vehicle.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {vehicle.registration_number}{" "}
                  <span className="text-muted-foreground">
                    | {vehicle.brand} {vehicle.model}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
