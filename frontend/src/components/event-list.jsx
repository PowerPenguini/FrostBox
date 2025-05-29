import {
  IconCirclePlusFilled,
  IconSettings,
  IconPlus,
} from "@tabler/icons-react";
import { formatDate } from "@/formatting/date";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/state/auth-context";
import { Button } from "./ui/button";
import { Spinner } from "./spinner";
import { ErrorText } from "./error-text";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddEventForm } from "./add-event-form";


export function EventList({ vehicleId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { token } = useAuthContext();
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
  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    
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
            {showForm && <AddEventForm fetchEvents={fetchEvents} vehicleId={vehicleId} setShowForm={setShowForm} />}
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

