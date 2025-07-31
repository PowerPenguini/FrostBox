import { useState, useEffect } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { translateCategory } from "@/formatting/category";
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
import { ErrorText } from "./error-text";

export function EventTypeCategoryCombobox({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {token} = useAuthContext()
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/events/types/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Nie udało się pobrać kategorii");
        const data = await res.json();
        setCategories(
          data.map((cat) => ({
            value: cat,
            label:  translateCategory(cat)
          }))
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  if (loading)
    return (
      <div className="w-full text-muted-foreground text-sm">
        Ładowanie kategorii...
      </div>
    );
  if (error) return <ErrorText>{error}</ErrorText>;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[250px]"
          disabled={disabled}
        >
          {value
            ? categories.find((c) => c.value === value)?.label
            : "Wybierz kategorię"}
          <ChevronsUpDownIcon className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[250px]">
        <Command>
          <CommandInput placeholder="Szukaj kategorii..." />
          <CommandList>
            <CommandEmpty>Brak kategorii.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 w-4 h-4",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
