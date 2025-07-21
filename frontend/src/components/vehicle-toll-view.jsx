
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DatePickerFilter } from "./date-picker-filter";
import { useAuthContext } from "@/state/auth-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export function VehicleTollView() {
  const { token } = useAuthContext(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTolls() {
      try {
        const from = "2022-07-17";
        const to = "2025-07-17";
        const vehicleID = "11111111-1111-1111-1111-111111111111";
        const url = `http://localhost/api/v1/vehicles/${vehicleID}/tolls?start_date=${from}&end_date=${to}`;

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
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelpHexagon className="stroke-muted-foreground w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Pomaga w ocenie xyz
                    <br />
                    (koszt opłaty drogowej / całkowity koszt)
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Udział w kosztach:</span>
            </div>
            <span>{data?.toll_percent_in_cost} %</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelpHexagon className="stroke-muted-foreground w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Pokazuje, jaki procent przychodów w danym okresie
                    pochłaniają opłaty drogowe
                    <br />
                    (opłaty drogowe / przychód w danym okresie)
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Udział w przychodach:</span>
            </div>
            <span>{data?.toll_percent_in_revenue} %</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelpHexagon className="stroke-muted-foreground w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Zwrot z 1 zł opłaty drogowej. Im wyższy wskaźnik, tym
                    większa efektywność kosztowa trasy.
                    <br />
                    (przychód / opłaty drogowe)
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Wskaźnik zwrotu:</span>
            </div>
            <span>x{data?.revenue_per_toll_unit}</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelpHexagon className="stroke-muted-foreground w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <br />
                    (przychód - opłąty drogowe)
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Zysk po opłatach drogowych:</span>
            </div>
            <span>{data?.revenue_after_tolls} zł</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelpHexagon className="stroke-muted-foreground w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Jaka część przychodu zostaje "na czysto" po zapłaceniu za
                    autostrady / opłaty drogowe.
                    <br />
                    ((przychód - opłaty drogowe) / przychód)
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">
                Wskaźnik efektywności przychodowej:
              </span>
            </div>
            <span>{data?.efficiency_after_toll} %</span>
          </div>
          <hr />
          <div className="flex justify-between">
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelpHexagon className="stroke-muted-foreground w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Średni koszt opłaty drogowej na pojazd pomaga kontrolować
                    wydatki,<br/>optymalizować trasy, porównywać efektywność aut i
                    poprawiać rentowność przewozów.
                    <br />
                    (opłaty drogowe / liczba opłat drogowych)
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Średni koszt opłaty drogowej</span>
            </div>
            <span>{data?.avg_toll_cost} zł</span>
          </div>
        </div>
      </div>
    </>
  );
}
