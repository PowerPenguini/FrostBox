import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { useState, useEffect } from "react";
import { VehicleDataRecord } from "./vehicle-data-record";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DatePickerFilter } from "./date-picker-filter";
import { useAuthContext } from "@/state/auth-context";


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

export function VehicleFuelView({item}) {
  const { token } = useAuthContext(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFuel() {
      try {
        const from = "2022-07-17";
        const to = "2025-07-17";
        const vehicleID = "11111111-1111-1111-1111-111111111111";
        const url = `http://localhost/api/v1/vehicles/${item.id}/fuel?start_date=${from}&end_date=${to}`;

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

    fetchFuel();

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
                    })
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
              data: data?.fuel_percent_in_cost,
              unit: "%",
              descrption: "Pomaga w ocenie xyz",
              formula: "(koszt palwia / całkowity koszt) * 100%",
            },
            {
              label: "Wskaźnik kosztów do przychodów (OER)",
              data: data?.operating_expense_ratio,
              unit: "%",
              descrption:
                "Wysoki wskaźnik kosztów paliwa wskazuje, że znaczna część przychodu jest wydawana na paliwo, co może sugerować niską efektywność operacyjną. Niski wskaźnik oznacza lepsze zarządzanie kosztami paliwa w stosunku do przychodów. 0-15% - dobrze 15-20 średnio, 20 > źle",
              formula: "(koszt paliwa / przychód w danym okresie) * 100%",
            },
            {
              label: "Wskaźnik zwrotu",
              data: data?.revenue_per_fuel_unit,
              unit: "x",
              descrption:
                "Przychód z 1 zł opłaty drogowej. Im wyższy wskaźnik, tym większa efektywność kosztowa trasy.",
              formula: "(przychód / opłaty drogowe)",
            },
            {
              label: "Zysk po kosztach paliwa",
              data: data?.revenue_after_fuel,
              unit: "zł",
              descrption: "Zysk po opłatach drogowych",
              formula: "(przychód - opłaty drogowe)",
            },
            {
              label: "Wskaźnik efektywności przychodowej",
              data: data?.efficiency_after_fuel,
              unit: "%",
              descrption:
                "Jaka część przychodu zostaje 'na czysto' po zapłaceniu za autostrady / opłaty drogowe.",
              formula: "((przychód - opłaty drogowe) / przychód) * 100%",
            },
            {
              label: "Średnia cena paliwa",
              data: data?.fuel_price_per_liter,
              unit: "zł/l",
              descrption:
                "",
              formula: "(opłaty drogowe / liczba opłat drogowych)",
            },
            {
              label: "Całkowita ilość paliwa",
              data: data?.total_fuel_liters,
              unit: "l",
              descrption:
                "",
              formula: "(opłaty drogowe / liczba opłat drogowych)",
            },
            {
              label: "ROI",
              data: data?.fuel_roi,
              unit: "%",
              descrption:
                "",
              formula: "(opłaty drogowe / liczba opłat drogowych)",
            },
          ].map((item, idx) => (
            <React.Fragment key={item.label}>
              <VehicleDataRecord {...item} />
              {idx < 7 && <hr />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
