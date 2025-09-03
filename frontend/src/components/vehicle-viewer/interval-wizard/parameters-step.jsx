import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { useEventTypes } from "@/state/event-types-context";

export function ParametersStep({
  currentCard,
  state,
  setDate,
  setKm,
  setMileage,
  setTime,
}) {
  const { idToTitleMap } = useEventTypes();
  const selectedTitles = Object.keys(state.selectedServices).filter(
    (id) => state.selectedServices[id]
  );

  const isComplete = (id) => {
    const val = state.intervalValues[id];
    return val?.mileage && val?.date && val?.km && val?.time;
  };

  return (
    <div className="relative flex justify-center items-center w-full h-full">
      {selectedTitles.map((id, index) => {
        const offset = index - currentCard;
        const isActive = offset === 0;
        const val = state.intervalValues[id] || {};
        const complete = isComplete(id);

        return (
          <motion.div
            key={id}
            initial={false}
            animate={{
              x: offset * 60,
              y: Math.abs(offset) * 10,
              scale: isActive ? 1 : 0.95,
              zIndex: isActive ? 10 : 5 - Math.abs(offset),
              opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.8,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bg-white shadow-lg p-6 border rounded-lg w-96 h-80"
          >
            <div className="flex flex-col gap-1 mb-6">
              {complete ? (
                <Badge className="flex items-center gap-1 bg-green-100 border-green-300 text-green-700">
                  <IconCircleCheckFilled className="fill-green-600 w-3 h-3" />
                  Uzupełnione
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 bg-gray-100 border-gray-300 text-gray-700">
                  <IconCircleCheckFilled className="fill-gray-600 w-3 h-3" />
                  Do uzupełnienia
                </Badge>
              )}
              <h2 className="font-bold text-lg">{idToTitleMap[id]}</h2>
              <p className="text-gray-500 text-sm">
                Rekomendowana częstotliwość: {val.recommended || "-"}
              </p>
            </div>

            <div className="gap-4 grid grid-cols-2">
              <div className="flex flex-col gap-4">
                <Label>Przebieg początkowy</Label>
                <Input
                  placeholder="np. 180000 km"
                  value={val.mileage || ""}
                  onChange={(e) => setMileage(id, e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Label>Data początkowa</Label>
                <Input
                  type="date"
                  placeholder="Wybierz datę"
                  value={val.date || ""}
                  onChange={(e) => setDate(id, e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Label>Interwał km</Label>
                <Input
                  placeholder="np. 15000 km"
                  value={val.km || ""}
                  onChange={(e) => setKm(id, e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Label>Interwał czasowy</Label>
                <Input
                  placeholder="np. 12 miesięcy"
                  value={val.time || ""}
                  onChange={(e) => setTime(id, e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
