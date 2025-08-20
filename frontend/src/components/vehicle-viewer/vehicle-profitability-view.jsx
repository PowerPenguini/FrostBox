import { Label, Pie, PieChart } from "recharts";
import { useState, useEffect, Fragment } from "react";
import { VehicleDataRecord } from "./vehicle-data-record";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DatePickerFilter } from "@/components/date-picker-filter";
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

export function VehicleProfitabilityView({ vehicle }) {
  const { token } = useAuthContext(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTolls() {
      try {
        const from = "2022-07-17";
        const to = "2025-07-17";
        const url = `http://localhost/api/v1/vehicles/${vehicle.id}/profitability?start_date=${from}&end_date=${to}`;

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
    <div className="px-4">
      <div className="flex items-center gap-4 font-medium text-lg">
        Opłaty drogowe
        <DatePickerFilter />
      </div>
      <div className="flex gap-6">
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
              label: "Suma kosztów",
              data: data?.total_cost,
              unit: "zł",
              descrption: "Suma wszystkich kosztów dla pojazdu",
            },
            {
              label: "Suma przychodów",
              data: data?.total_revenue,
              unit: "zł",
              descrption: "Suma wszystkich kosztów dla pojazdu",
            },
            {
              label: "Zysk",
              data: data?.profit,
              unit: "zł",
              descrption: "Całkowity zysk dla pojazdu",
              formula: "(całkowity przychód - całkowity koszt)",
            },
            {
              label: "ROI",
              data: data?.roi,
              unit: "%",
              descrption:
                "Wartość ROI pokazuje, ile zarobiłeś na każdej jednostce wydanej kwoty (np. 1 PLN zainwestowany zwrócił 0,5 PLN zysku, ROI = 0.5, czyli 50%)",
              formula: "(całkowity przychód - całkowity koszt) / koszt) * 100%",
            },
            {
              label: "Wskaźnik rentowności",
              data: data?.profitability_ratio,
              unit: "%",
              descrption:
                "Wskaźnik rentowności to procentowy udział zysku netto w przychodach ze sprzedaży. Wysoki wskaźnik wskazuje na efektywne zarządzanie kosztami",
              formula: "(zysk / przychód) * 100%",
            },
          ].map((item, idx) => (
            <Fragment key={item.label}>
              <VehicleDataRecord {...item} />
              {idx < 5 && <hr />}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
