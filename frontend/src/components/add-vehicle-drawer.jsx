import { useState } from "react";
import { useVehiclesDataContext } from "@/state/vehicles-data-context";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Label } from "./ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthContext } from "@/state/auth-context";

export function AddVehicleDrawer() {
  const { refetchData } = useVehiclesDataContext();
  const { token } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [vin, setVin] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const isMobile = useIsMobile();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!brand) {
      // TODO add validation
      setError("Wprowadź markę pojazdu");
      return;
    }

    if (!model) {
      setError("Wprowadź model pojazdu");
      return;
    }

    if (!vin) {
      setError("Wprowadź VIN pojazdu");
      return;
    }

    if (!registrationNumber) {
      setError("Wprowadź numer rejestracyjny");
      return;
    }

    const payload = {
      vin,
      brand,
      model,
      registration_number: registrationNumber,
    };

    try {
      const response = await fetch("/api/v1/vehicles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast("Pojazd dodany pomyślnie!");
      } else {
        toast("Błąd podczas dodawania pojazdu.");
      }
    } catch (error) {
      toast("Błąd sieci podczas przesyłania dokumentu.");
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
          <span className="hidden lg:inline">Dodaj pojazd</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Dodaj pojazd</DrawerTitle>
          <DrawerDescription>
            Pojazd musi być dodany do systemu, aby móg być poprawnie rozpoznany
            na dokumentach kosztowych i przychodowych.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                placeholder="Volvo"
                onChange={(e) => setBrand(e.target.value)}
              />
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="FMX"
                onChange={(e) => setModel(e.target.value)}
              />
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                placeholder="5N1AR2MN8FC123456"
                onChange={(e) => setVin(e.target.value)}
              />
              <Label htmlFor="registration_number">Numer rejestracyjny</Label>
              <Input
                id="registration_number"
                placeholder="EL2K25"
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />

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
