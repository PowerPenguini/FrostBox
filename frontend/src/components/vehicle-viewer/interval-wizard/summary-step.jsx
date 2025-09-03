import React from "react";
import { motion } from "framer-motion";
import {
  IconChecklist,
  IconCalendar,
  IconRoad,
  IconClockHour4,
  IconGauge,
} from "@tabler/icons-react";
import { useEventTypes } from "@/state/event-types-context";

export function SummaryStep({ state }) {
  const { idToTitleMap } = useEventTypes();

  const selectedTitles = Object.keys(state.selectedServices).filter(
    (id) => state.selectedServices[id]
  );

  return (
    <div className="mx-auto p-6 w-full max-w-6xl">
      <div className="mb-6 text-center">
        <h2 className="flex justify-center items-center gap-2 mb-1 font-semibold text-foreground text-xl">
          <IconChecklist className="w-6 h-6 text-primary" />
          Interwały 
        </h2>
        <p className="text-muted-foreground text-sm">Interwały wraz z ustalonymi parametrami <br/>(jeśli istnieje zdarzenie danego typu jest uznawane za punkt startowy)</p>
      </div>
      <div className="gap-6 grid grid-cols-2">
        {selectedTitles.map((id, index) => {
          const val = state.intervalValues[id] || {};

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-5 border rounded-2xl transition-shadow"
            >
              <h3 className="flex items-center h-12 font-semibold text-base">{idToTitleMap[id]}</h3>

              <div className="gap-4 grid grid-cols-2 text-center">
                <StatCard
                  icon={<IconGauge className="mx-auto w-5 h-5 text-blue-500" />}
                  label="Przebieg startowy"
                  value={(val.mileage || "-") + " km"}
                />
                <StatCard
                  icon={
                    <IconCalendar className="mx-auto w-5 h-5 text-purple-500" />
                  }
                  label="Data statrowa"
                  value={val.date || "-"}
                />
                <StatCard
                  icon={
                    <IconRoad className="mx-auto w-5 h-5 text-orange-500" />
                  }
                  label="Interwał przebiegu"
                  value={(val.km || "-") + " km"}
                />
                <StatCard
                  icon={
                    <IconClockHour4 className="mx-auto w-5 h-5 text-pink-500" />
                  }
                  label="Interwał czasu"
                  value={val.time || "-"}
                />
              </div>

              {/* Rekomendacja na dole */}
              <div className="pt-3 border-t text-gray-500 text-sm text-center">
                Rekomendacja:{" "}
                <span className="font-medium text-gray-800">
                  {val.recommended || "-"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
