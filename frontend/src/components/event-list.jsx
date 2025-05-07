import {
  IconCirclePlusFilled,
  IconSettings,
  IconPlus,
} from "@tabler/icons-react";
import { formatDate } from "@/formatting/date";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/state/auth-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DatePickerPopover } from "./ui/date-picker-popover";
import { Spinner } from "./spinner";
import { ErrorText } from "./error-text";
import { EventTypeCombox } from "./event-type-combox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CurrencyCombox } from "./currency-combox";
import { IconDeviceFloppy } from "@tabler/icons-react";
export function EventList({ vehicleId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { token } = useAuthContext();

  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    async function fetchEvents() {
      try {
        const response = await fetch(`/api/v1/vehicles/${vehicleId}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Sieć niedostępna");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [vehicleId]);

  return (
    <div className="flex flex-col gap-2 bg-muted p-6 rounded-r-xl w-1/3 h-full">
      <div className="flex items-center gap-4 font-medium text-lg">
        Zdarzenia
        <Button
          className="text-sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <IconPlus />
          Dodaj zdarzenie
        </Button>
      </div>

      {loading && (
        <div className="place-items-center grid p-4 w-full">
          <Spinner />
        </div>
      )}

      {error && <ErrorText text="Nie udało sie pobrać zdarzeń" />}

      {!loading && !error && (
        <ScrollArea className="relative flex-1 min-h-0">
          <ol className="relative ml-3 py-6 border-gray-200 border-s">
            {showForm && <AddEventForm setShowForm={setShowForm} />}
            {events.map((event) => (
              <Event
                key={event.id}
                title={event.event_type}
                mileage={event.mileage}
                date={event.date}
              />
            ))}
            <li className="ms-8">
              <span className="absolute flex justify-center items-center rounded-full w-6 h-6 text-accent bg-accent-foreground -start-3">
                <IconCirclePlusFilled className="w-4" />
              </span>
              <h3 className="font-medium text-sm">Dodanie pojazdu</h3>
            </li>
          </ol>
          <div className="top-0 left-0 absolute bg-gradient-to-t from-transparent to-muted w-full h-6 pointer-events-none" />
          <div className="bottom-0 left-0 absolute bg-gradient-to-t from-muted to-transparent w-full h-6 pointer-events-none" />
        </ScrollArea>
      )}
    </div>
  );
}

function Event({ title, mileage, date }) {
  return (
    <li className="ms-8 mb-8">
      <span className="absolute flex justify-center items-center rounded-full w-6 h-6 text-accent bg-accent-foreground -start-3">
        <IconSettings className="w-4" />
      </span>
      <h3 className="font-medium text-sm">{title}</h3>
      <time className="block text-muted-foreground text-sm">
        {formatDate(date)} &bull; {mileage} km
      </time>
    </li>
  );
}

function AddEventForm({ vehicleId, setEvents, setShowForm }) {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    event_type: "",
    mileage: "",
    date: "",
    cost_name: "",
    cost_amount: "",
    currency: "",
  });

  const handleAddEvent = async () => {
    try {
      const response = await fetch(`/api/v1/vehicles/${vehicleId}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: formData.event_type,
          mileage: parseInt(formData.mileage),
          date: formData.date,
          cost:
            formData.cost_name && formData.cost_amount
              ? {
                  name: formData.cost_name,
                  amount: parseFloat(formData.cost_amount),
                }
              : null,
        }),
      });

      if (!response.ok) throw new Error("Błąd podczas dodawania zdarzenia");

      const newEvent = await response.json();
      setEvents((prev) => [newEvent, ...prev]);
      setFormData({
        event_type: "",
        mileage: "",
        date: "",
        cost_name: "",
        cost_amount: "",
        vat_rate: "",
        currency: "",
      });
      setShowForm(false);
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <li className="flex flex-col ms-8 mb-8">
      <span className="absolute flex justify-center items-center rounded-full w-6 h-6 text-accent bg-accent-foreground -start-3">
        <IconPlus className="w-4" />
      </span>
      <h3 className="mb-2 font-medium text-sm">
        {formStep === 1 ? "Dodanie zdarzenia" : "Dodanie kosztu"}
      </h3>

      <form className="flex flex-col gap-4 bg-background p-4 border-1 rounded-xl">
        {formStep === 1 && (
          <>
            <EventTypeCombox
              value={formData.event_type}
              onChange={(value) =>
                setFormData({ ...formData, event_type: value })
              }
            />
            <Input
              type="number"
              placeholder="Przebieg"
              value={formData.mileage}
              min="0"
              onChange={(e) =>
                setFormData({ ...formData, mileage: e.target.value })
              }
            />
            <DatePickerPopover
              value={formData.date}
              onChange={(newDate) =>
                setFormData({ ...formData, date: newDate })
              }
              text="Data zdarzenia"
            />
          </>
        )}

        {formStep === 2 && (
          <>
            <Input
              type="number"
              placeholder="Kwota (opcjonalnie)"
              value={formData.cost_amount}
              min="0"
              onChange={(e) =>
                setFormData({ ...formData, cost_amount: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Stawka VAT (opcjonalnie)"
              value={formData.vat_rate}
              min="0"
              max="100"
              onChange={(e) =>
                setFormData({ ...formData, vat_rate: e.target.value })
              }
            />
            <CurrencyCombox
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e })}
            />
          </>
        )}

        <div className="flex justify-between">
          {formStep > 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => setFormStep(formStep - 1)}
              >
                Wstecz
              </Button>
              <Button onClick={handleAddEvent}>
                <IconDeviceFloppy />
                Zapisz zdarzenie
              </Button>
            </>
          )}
          {formStep < 2 && (
            <>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Anuluj
              </Button>
              <Button onClick={() => setFormStep(formStep + 1)}>Dalej</Button>
            </>
          )}
        </div>
      </form>
    </li>
  );
}
