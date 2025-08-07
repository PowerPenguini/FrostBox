import { IconPlus } from "@tabler/icons-react";
import { useAuthContext } from "@/state/auth-context";
import { Spinner } from "./spinner";
import { ErrorText } from "@/components/error-text";
import { toast } from "sonner";
import { VehicleInterval } from "./vehicle-interval";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { getVehicleIntervals, deleteInterval } from "@/api/vehicles";

export function VehicleServiceView({ open, vehicle }) {
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  const fetchIntervals = async () => {
    try {
      const data = await getVehicleIntervals(vehicle.id, token);
      setIntervals(data);
    } catch (err) {
      setError(err.message);
      toast.error("Nie udało się pobrać interwałów");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteInterval(id, token);
      setIntervals((prev) => prev.filter((i) => i.id !== id));
      toast.success("Interwał został usunięty");
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchIntervals();
  }, [open, vehicle.id, token]);

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
          <div className="place-items-center grid col-span-2 p-4 w-full">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorText text={error} />
        ) : intervals.length > 0 ? (
          intervals.map((interval) => (
            <VehicleInterval
              key={interval.id}
              interval={interval}
              onDelete={() => handleDelete(interval.id) }
            />
          ))
        ) : (
          <div className="col-span-2 text-muted-foreground">
            Brak zdefiniowanych interwałów.
          </div>
        )}
      </div>
    </>
  );
}
