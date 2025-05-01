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

export function EventList({ vehicleId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    event_type: "",
    mileage: "",
    date: "",
  });
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
        if (!response.ok) throw new Error("Failed to fetch events");
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
        }),
      });

      if (!response.ok) throw new Error("Failed to add event");

      const newEvent = await response.json();
      setEvents((prev) => [newEvent, ...prev]);
      setFormData({ event_type: "", mileage: "", date: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  return (
    <>
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
        <ol className="relative ml-3 border-gray-200 border-s">
          {showForm && (
            <li className="flex flex-col ms-8 mb-8">
              <span className="absolute flex justify-center items-center rounded-full w-6 h-6 text-accent bg-accent-foreground -start-3">
                <IconPlus className="w-4" />
              </span>
              <h3 className="mb-2 font-medium text-sm">Dodanie zlecenia</h3>
              <div className="flex flex-col gap-4 bg-background p-4 border-1 rounded-xl">
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
                <Button onClick={handleAddEvent}>Zapisz zdarzenie</Button>
              </div>
            </li>
          )}
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
      )}
    </>
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
