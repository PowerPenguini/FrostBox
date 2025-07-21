import { IconPlus } from "@tabler/icons-react";
import { useAuthContext } from "@/state/auth-context";
import { Spinner } from "./spinner";
import { ErrorText } from "@/components/error-text";
import { toast } from "sonner";
import { VehicleInterval } from "./vehicle-interval";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function VehicleServiceView({ open, item }) {
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token } = useAuthContext();

  useEffect(() => {
    if (!open) return;
    async function fetchIntervals() {
      try {
        const response = await fetch(`/api/v1/vehicles/${item.id}/intervals`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch intervals");
        }
        const data = await response.json();
        setIntervals(data);
      } catch (error) {
        toast("Nie udało się pobrać interwałów pojazdu");
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchIntervals();
  }, [open, item.id]);
  return (
    <>
      <div className="flex items-center gap-4 font-medium text-lg">
        Interwały
        <Button className="text-sm" variant="outline">
          <IconPlus />
          Dodaj interwał
        </Button>
      </div>
      <div className="gap-4 grid grid-cols-2">
        {loading ? (
          <div className="place-items-center grid col-span-3 p-4 w-full">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorText text={error} />
        ) : intervals.length > 0 ? (
          intervals.map((interval) => (
            <VehicleInterval ke1y={interval.id} interval={interval} />
          ))
        ) : (
          <div className="text-muted-foreground">
            Brak zdefiniowanych interwałów.
          </div>
        )}
      </div>
    </>
  );
}
