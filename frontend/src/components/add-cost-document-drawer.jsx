import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCostDocumentsDataContext } from "@/state/cost-documents-data-context";
import { toast } from "sonner";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerDescription,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Label } from "./ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "./ui/input";
const typeOptions = {
  uta: [{ value: "cost_breakdown", label: "Zestawienie kosztów" }],
  gastruck: [
    { value: "cars_invoice", label: "Faktura z podziałem na pojazdy" },
  ],
};

export function AddCostDocumentDrawer() {
  const { refetchData } = useCostDocumentsDataContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [type, setType] = useState("");
  const isMobile = useIsMobile();
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!source) {
      setError("Wybierz źródło dokumentu");
      return;
    }

    if (!type) {
      setError("Wybierz typ dokumentu");
      return;
    }

    if (!file) {
      setError("Wybierz plik");
      return;
    }

    const formData = new FormData();
    formData.append("source", source);
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/analysers/uta/upload/", {
        method: "POST",
        body: formData,
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
          <span className="hidden lg:inline">Dodaj dokument</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Dodaj dokument kosztowy</DrawerTitle>
          <DrawerDescription>
            Dodaj znane dokumenty, aby zautomatyzować rejestrację kosztów
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Label htmlFor="source">Źródło</Label>
              <Select
                onValueChange={(value) => {
                  setSource(value);
                  setType("");
                }}
              >
                {/* TODO: PROPER FORM SYNTAX  */}
                <SelectTrigger id="source" className="w-full">
                  <SelectValue placeholder="Wybierz źródło" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uta">UTA</SelectItem>
                  <SelectItem value="gastruck">GasTruck</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="type">Typ dokumentu</Label>
              <Select
                onValueChange={(value) => setType(value)}
                disabled={!source}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Wybierz typ dokumentu" />
                </SelectTrigger>
                <SelectContent>
                  {source &&
                    typeOptions[source].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Label htmlFor="file">Plik</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
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
