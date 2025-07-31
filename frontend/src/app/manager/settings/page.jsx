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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  IconDotsVertical,
  IconDeviceFloppy,
  IconPlus,
} from "@tabler/icons-react";
import { Spinner } from "@/components/spinner";
import { ErrorText } from "@/components/error-text";
import { useAuthContext } from "@/state/auth-context";
import { renderCategory } from "@/formatting/category";
import { Input } from "@/components/ui/input";
import { EventTypeCategoryCombobox } from "@/components/event-type-category-combox";

export default function Page() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/v1/events/types", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Błąd sieci");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <div className="@container/main flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-4 md:gap-6 px-4 lg:px-6 py-4 lg:py-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Typy zdarzeń</AccordionTrigger>
              <AccordionContent>
                {loading ? (
                  <div className="flex flex-col space-y-4">
                    <Spinner />
                    <div className="text-center">Pobieranie danych...</div>
                  </div>
                ) : error ? (
                  <div>
                    <ErrorText>{error}</ErrorText>
                  </div>
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
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{event.name}</TableCell>
                          {/* proper component here */}
                          <TableCell>
                            {renderCategory(event.category)}
                          </TableCell>
                          <TableCell>{event.system ? "Tak" : "Nie"}</TableCell>
                          <TableCell>
                            {!event.system && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex data-[state=open]:bg-muted size-8 text-muted-foreground"
                                    size="icon"
                                  >
                                    <IconDotsVertical />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-32"
                                >
                                  <DropdownMenuItem variant="destructive">
                                    Usuń
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <AddEventTypeRow
                        onAdd={(newEvent) =>
                          setEvents((prev) => [...prev, newEvent])
                        }
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
                  Produkt: FrostBox&trade;
                  <br />
                  Wersja: v0.0.1
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
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
    setError("");

    try {
      const response = await fetch("/api/v1/events/types", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, category, system }),
      });

      if (!response.ok) throw new Error("Nie udało się dodać typu.");

      const data = await response.json();
      onAdd(data);
      setName("");
      setCategory("");
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
            <IconDeviceFloppy/>Zapisz
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
            <ErrorText>{error}</ErrorText>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
