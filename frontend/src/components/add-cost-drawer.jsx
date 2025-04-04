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

export function AddCostDrawer() {
  const { refetchData } = useCostsDataContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();

  const handleSubmit = async (event) => {

    
    event.preventDefault();
    
    try {
      const response = await fetch("/api/v1/analysers/uta/upload/", {
        method: "POST",
        body: {},
      });

      if (response.ok) {
        toast("Dokument dodany pomyślnie!");
      } else {
        toast("Błąd podczas przesyłania dokumentu.");
      }
    } catch (error) {
      toast("Błąd sieci podczas przesyłania dokumentu.");
    } finally {
      refetchData();
      setOpen(false);
      setFile(null);
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
            Dodaj pojedynczy koszt, możesz przypisać go do określoych zasobów
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              {/* TODO:  FIX FORMS */}
              <Label htmlFor="source">Tytuł</Label>
              <Input placeholder="Opłata drogowa" />
              <Label htmlFor="source">Kwota</Label>
              <Input type="number" placeholder="0.00" min="0" step="0.01" />
              <Label htmlFor="source">Stawka VAT (%)</Label>
              <Input type="number" placeholder="0" min="0" max="100" />
              <Label htmlFor="source">Waluta</Label>
              <CurrencyCombox/>
              <Label htmlFor="source">Pojazd</Label>
              <VehiclesCombox />
              <Label htmlFor="source">Kategoria</Label>
              <CategoryCombox />
              <Label htmlFor="source">Amortyzacja (mies.)</Label>
              <Input type="number"  placeholder="1" min="1" max="240" />

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
