import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { CurrencyCombox } from "./currency-combox";
import { toast } from "sonner";
import { useAuthContext } from "@/state/auth-context";
import { DatePickerPopover } from "@/components/ui/date-picker-popover";
import { ErrorText } from "@/components/error-text";
import { useRevenuesDataContext } from "@/state/revenues-data-context";
import { VehiclesCombox } from "./vehicles-combox";

export function AddRevenueDrawer() {
  const { refetchData } = useRevenuesDataContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [vat, setVat] = useState("");
  const [currency, setCurrency] = useState("PLN");
  const [vehicle, setVehicle] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [costDate, setCostDate] = useState(new Date());
  const { token } = useAuthContext();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !value || !currency) {
      // TODO: rework front validation
      setError("Proszę wypełnić wymagane pola.");
      return;
    }
    setError("");

    const payload = {
      title,
      value: value,
      vat_rate: vat,
      currency,
      vehicle_id: vehicle === "" ? null : vehicle,
      category,
      amortization: parseInt(amortization),
      quantity,
      cost_date: invoiceDate?.toISOString(),
      invoice_date: costDate?.toISOString(),
    };
    try {
      const response = await fetch("/api/v1/costs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast("Koszt dodany pomyślnie!");
      } else {
        toast("Błąd podczas przesyłania kosztu.");
      }
    } catch (error) {
      console.log(error);
      toast("Błąd sieci podczas przesyłania kosztu.");
    } finally {
      refetchData();
      setOpen(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Dodaj koszt</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Dodaj przychód</DrawerTitle>
          <DrawerDescription>
            Dodaj pojedynczy przychód, możesz przypisać go do określonych zasobów
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Label htmlFor="title">Tytuł</Label>
              <Input
                id="title"
                placeholder="Opłata drogowa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Label htmlFor="value">Kwota</Label>
              <Input
                type="number"
                id="value"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />

              <Label htmlFor="vat">Stawka VAT (%)</Label>
              <Input
                type="number"
                id="vat"
                placeholder="0"
                min="0"
                max="100"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
              />

              <Label htmlFor="currency">Waluta</Label>
              <CurrencyCombox
                id="currency"
                value={currency}
                onChange={setCurrency}
              />

              <Label htmlFor="vehicle">Pojazd</Label>
              <VehiclesCombox
                id="vehicle"
                value={vehicle}
                onChange={setVehicle}
              />

              <Label htmlFor="invoiceDate">Data faktury</Label>
              <DatePickerPopover
                id="invoiceDate"
                value={invoiceDate}
                onChange={setInvoiceDate}
              />

              <Label htmlFor="revenueDate">Data przychodu</Label>
              <DatePickerPopover id="revenueDate" value={costDate} onChange={setCostDate} />

              {error && (
                <ErrorText text={error} />
              )}
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button form="cost-document-form" type="submit">
            Dodaj
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
