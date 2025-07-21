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
import { AddEventForm } from "./add-event-form";

export function VehicleEventListView({ vehicleId }) {
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
    <div className="flex flex-col gap-4">
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
            <AddEventForm
              fetchEvents={fetchEvents}
              vehicleId={vehicleId}
              setShowForm={setShowForm}
            />
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
