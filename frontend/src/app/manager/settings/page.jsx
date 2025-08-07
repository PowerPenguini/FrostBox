"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconPlus , IconDeviceFloppy} from "@tabler/icons-react";
import { Spinner } from "@/components/spinner";
import { ErrorText } from "@/components/error-text";
import { useAuthContext } from "@/state/auth-context";
import { renderCategory } from "@/formatting/category";
import { DeleteDialog } from "@/components/delete-dialog";
import { Input } from "@/components/ui/input";
import { EventTypeCategoryCombobox } from "@/components/event-type-category-combox";
import { deleteEventType } from "@/api/eventsTypes";
import { toast } from "sonner";

export default function Page() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { token } = useAuthContext();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/events/types", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Błąd sieci");
      const data = await res.json();
      setEventTypes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
  try {
    await deleteEventType(id, token);
    setEventTypes((prev) => prev.filter(eventType => eventType.id !== id));
    setSelectedId(null);
  } catch (error) {
    toast.error(error.message);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col flex-1 p-4 lg:p-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Typy zdarzeń</AccordionTrigger>
          <AccordionContent>
            {loading ? (
              <div className="space-y-4 text-center">
                <Spinner />
                <div>Pobieranie danych...</div>
              </div>
            ) : error ? (
              <ErrorText text={error}/>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nazwa</TableHead>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Systemowe</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventTypes.map((eventType) => (
                    <TableRow key={eventType.id}>
                      <TableCell>{eventType.name}</TableCell>
                      <TableCell>
                        {renderCategory(eventType.category)}
                      </TableCell>
                      <TableCell>{eventType.system ? "Tak" : "Nie"}</TableCell>
                      <TableCell>
                        {!eventType.system && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="size-8 text-muted-foreground"
                              >
                                <IconDotsVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem variant="destructive"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedId(eventType.id);
                                }}
                              >
                                Usuń
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <AddEventTypeRow
                    onAdd={(e) => setEventTypes((prev) => [...prev, e])}
                    token={token}
                  />
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Informacje o systemie</AccordionTrigger>
          <AccordionContent>
            <div className="text-muted-foreground text-sm">
              Produkt: FrostBox™
              <br />
              Wersja: v0.0.1
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <DeleteDialog
        title="Jesteś pewny?"
        description="Usunięcie typu zdarzenia jest nieodwracalne. Typ zdarzenia nie będzie mógł być używany w systemie."
        open={selectedId !== null}
        onCancel={() => setSelectedId(null)}
        onDelete={() => handleDelete(selectedId)}
      />
    </div>
  );
}

function AddEventTypeRow({ onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [system, setSystem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuthContext();

  const handleAdd = async () => {
    if (!name || !category) {
      setError("Wszystkie pola są wymagane.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/v1/events/types", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, category, system }),
      });

      if (!response.ok) throw new Error("Typ zdarzenia już istnieje");

      const data = await response.json();
      onAdd(data);
      setName("");
      setCategory("");
      setError("")
      setSystem(false);
      setExpanded(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <TableRow>
        <TableCell colSpan={4}>
          <Button
            variant="outline"
            onClick={() => setExpanded(true)}
            className="justify-center w-full"
          >
            <IconPlus className="mr-2" size={18} />
            Dodaj typ zdarzenia
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <Input
            placeholder="Nazwa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </TableCell>
        <TableCell>
          <EventTypeCategoryCombobox
            token={token}
            value={category}
            onChange={setCategory}
            disabled={submitting}
          />
        </TableCell>
        <TableCell></TableCell>
        <TableCell className="flex gap-2">
          <Button
            onClick={handleAdd}
            disabled={submitting || !name || !category}
          >
            <IconDeviceFloppy />
            Zapisz
          </Button>
          <Button
            variant="ghost"
            onClick={() => setExpanded(false)}
            disabled={submitting}
          >
            Anuluj
          </Button>
        </TableCell>
      </TableRow>
      {error && (
        <TableRow>
          <TableCell colSpan={4}>
            <ErrorText text={error}/>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
