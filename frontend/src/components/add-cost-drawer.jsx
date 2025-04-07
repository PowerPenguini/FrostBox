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
import { VehiclesCombox } from "./vehicles-combox";
import { useCostsDataContext } from "@/state/costs-data-context";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { CurrencyCombox } from "./currency-combox";
import { CategoryCombox } from "./catergory-combox";
import { toast } from "sonner";
import { useAuthContext } from "@/state/auth-context";
import { DatePickerPopover } from "@/components/ui/date-picker-popover";

export function AddCostDrawer() {
  const { refetchData } = useCostsDataContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [vat, setVat] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [currency, setCurrency] = useState("PLN");
  const [vehicle, setVehicle] = useState("");
  const [category, setCategory] = useState("");
  const [amortization, setAmortization] = useState(1);
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
    console.log(JSON.stringify(payload));
    console.log("Bearer ${token}");
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
          <DrawerTitle>Dodaj koszt</DrawerTitle>
          <DrawerDescription>
            Dodaj pojedynczy koszt, możesz przypisać go do określonych zasobów
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

              <Label htmlFor="quantity">Ilość</Label>
              <Input
                type="number"
                id="quantity"
                placeholder="1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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

              <Label htmlFor="category">Kategoria</Label>
              <CategoryCombox
                id="category"
                value={category}
                onChange={setCategory}
              />

              <Label htmlFor="amortization">Amortyzacja (mies.)</Label>
              <Input
                type="number"
                id="amortization"
                placeholder="1"
                min="1"
                max="240"
                value={amortization}
                onChange={(e) => setAmortization(e.target.value)}
              />

              <Label htmlFor="invoiceDate">Data faktury</Label>
              <DatePickerPopover
                value={invoiceDate}
                onChange={setInvoiceDate}
              />

              <Label htmlFor="costDate">Data kosztu</Label>
              <DatePickerPopover value={costDate} onChange={setCostDate} />

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
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
