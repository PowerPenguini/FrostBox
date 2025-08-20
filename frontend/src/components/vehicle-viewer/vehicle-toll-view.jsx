import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { useState, useEffect } from "react";
import { VehicleDataRecord } from "./vehicle-data-record";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DatePickerFilter } from "@/components/date-picker-filter";
import { useAuthContext } from "@/state/auth-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconHelpHexagon } from "@tabler/icons-react";

const chartConfig = {
  DEU: {
    label: "DEU",
    color: "var(--chart-1)",
  },
  AUT: {
    label: "AUT",
    color: "var(--chart-2)",
  },
  CZE: {
    label: "CZE",
    color: "var(--chart-3)",
  },
};

export function VehicleTollView({ open, item }) {
  const { token } = useAuthContext(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTolls() {
      try {
        const from = "2022-07-17";
        const to = "2025-07-17";
        const url = `http://localhost/api/v1/vehicles/${item.id}/tolls?start_date=${from}&end_date=${to}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unexpected error");
        }
      }
    }

    fetchTolls();

    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="flex items-center gap-4 font-medium text-lg">
        Opłaty drogowe
        <DatePickerFilter />
      </div>
      <div className="flex items-center gap-6">
        <div className="w-[250px]">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              {data && data.country_distribution ? (
                <Pie
                  data={Object.entries(data.country_distribution).map(
                    ([country, val]) => ({
                      country,
                      tolls: parseFloat(val.toll_distribution_main_currency),
                      fill: chartConfig[country]?.color || "#ccc",
                    }),
                  )}
                  dataKey="tolls"
                  nameKey="country"
                  innerRadius={100}
                  outerRadius={125}
                  paddingAngle={0}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground font-bold text-3xl"
                            >
                              {data?.total_toll_main_currency ?? "—"} zł
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Suma opłat
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              ) : (
                <p>Ładowanie danych...</p>
              )}
            </PieChart>
          </ChartContainer>
        </div>
        <div className="flex flex-col flex-1 gap-2">
          {[
            {
              label: "Udział w kosztach",
              data: data?.toll_percent_in_cost,
              unit: "%",
              descrption: "Pomaga w ocenie xyz",
              formula: "(koszt opłaty drogowej / całkowity koszt) * 100%",
            },
            {
              label: "Wskaźnik kosztów do przychodów (OER)",
              data: data?.toll_percent_in_revenue,
              unit: "%",
              descrption:
                "Pokazuje, jaki procent przychodów w danym okresie pochłaniają opłaty drogowe",
              formula: "(opłaty drogowe / przychód w danym okresie) * 100%",
            },
            {
              label: "Wskaźnik zwrotu",
              data: data?.revenue_per_toll_unit,
              unit: "x",
              descrption:
                "Przychód z 1 zł opłaty drogowej. Im wyższy wskaźnik, tym większa efektywność kosztowa trasy.",
              formula: "(przychód / opłaty drogowe)",
            },
            {
              label: "Zysk po opłatach drogowych",
              data: data?.revenue_after_tolls,
              unit: "zł",
              descrption: "Zysk po opłatach drogowych",
              formula: "(przychód - opłaty drogowe)",
            },
            {
              label: "Wskaźnik efektywności przychodowej",
              data: data?.efficiency_after_toll,
              unit: "%",
              descrption:
                "Jaka część przychodu zostaje 'na czysto' po zapłaceniu za autostrady / opłaty drogowe.",
              formula: "((przychód - opłaty drogowe) / przychód) * 100%",
            },
            {
              label: "Średni koszt opłaty drogowej",
              data: data?.avg_toll_cost,
              unit: "zł",
              descrption:
                "Średni koszt opłaty drogowej na pojazd pomaga kontrolować wydatki, optymalizować trasy, porównywać efektywność aut i poprawiać rentowność przewozów.",
              formula: "(opłaty drogowe / liczba opłat drogowych)",
            },
          ].map((item, idx) => (
            <React.Fragment key={item.label}>
              <VehicleDataRecord {...item} />
              {idx < 5 && <hr />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
