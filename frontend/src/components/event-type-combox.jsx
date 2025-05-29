"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorText } from "./error-text";
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
import {IconCloudDown} from "@tabler/icons-react"

export function EventTypeCombox({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/v1/events/types", {
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
        setTypes(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, [token]);

  if (error)
    return (
      <div>
        <ErrorText text={error} />
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
          {loading ? (
            <ComboxDownloadState/>
          ) : (
            types.find((type) => type.id === value)?.name || "Typ zdarzenia"
          )}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]">
        <Command
          id={id}
          filter={(val, search) =>
            val.toLowerCase().includes(search.toLowerCase())
          }
        >
          <CommandInput placeholder="Typ zdarzenia" />
          <CommandList>
            <CommandEmpty>Nie znaleziono typu zdarzenia</CommandEmpty>
            <CommandGroup>
              {types.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.name}
                  onSelect={(currentValue) => {
                    const selected = types.find((t) => t.name === currentValue);
                    onChange(selected?.id || "");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === type.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {type.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


function ComboxDownloadState() {
  return <div className="flex gap-2"> <IconCloudDown/><div>Pobieranie danych... </div></div>
}