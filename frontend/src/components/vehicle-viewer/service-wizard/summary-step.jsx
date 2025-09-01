import React from "react";
import {
  IconChecklist,
  IconInfoCircle,
  IconCalendarEvent,
  IconRoad,
  IconBasketDollar,
  IconCurrencyDollar,
  IconHammer,
  IconPackage,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { ErrorText } from "@/components/error-text";
import { useEventTypes } from "@/state/event-types-context";
export function SummaryStep({
  selectedServices,
  costs,
  serviceDate,
  serviceMileage,
  error,
}) {
  const {idToTitleMap} = useEventTypes();
  const formatNumber = (value) =>
    new Intl.NumberFormat("pl-PL").format(Number(value || 0));

  const formatMoney = (value, currency) =>
    `${new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0))} ${currency || ""}`;

  const pluralize = (n) =>
    n === 0 ? "pozycji" : n === 1 ? "pozycja" : n < 5 ? "pozycje" : "pozycji";

  const visibleServices = Object.keys(selectedServices || {}).filter(
    (s) => selectedServices[s]
  );

  const allCosts = visibleServices.flatMap((s) => costs?.[s] || []);
  const grandTotal = allCosts.reduce((sum, c) => {
    const unit = Number(c.value || 0);
    const qty = Number(c.quantity || 1);
    const vatPct = Number(c.vat || 0);
    return sum + unit * qty * (1 + vatPct / 100);
  }, 0);

  const materialCount = allCosts.filter((c) => c.type === "material").length;
  const serviceCount = allCosts.filter((c) => c.type === "service").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Nagłówek */}
      <div className="text-center">
        <h2 className="flex justify-center items-center gap-2 mb-1 font-semibold text-foreground text-xl">
          <IconChecklist className="w-6 h-6 text-primary" />
          Podsumowanie serwisu
        </h2>
        <p className="text-muted-foreground text-sm">Wybrane usługi i koszty</p>
      </div>

      {/* Informacje podstawowe */}
      <div className="p-4 border rounded-xl">
        <h3 className="flex items-center gap-2 mb-3 font-medium text-foreground">
          <IconInfoCircle className="w-5 h-5 text-blue-500" />
          Informacje podstawowe
        </h3>
        <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconCalendarEvent className="w-4 h-4" />
              Data serwisu
            </div>
            <span className="font-medium text-foreground">
              {serviceDate
                ? new Date(serviceDate).toLocaleDateString("pl-PL")
                : "—"}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconRoad className="w-4 h-4" />
              Przebieg
            </div>
            <span className="font-medium text-foreground">
              {serviceMileage != null
                ? `${formatNumber(serviceMileage)} km`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Szczegóły kosztów */}
      <div className="space-y-6">
        <h3 className="flex items-center gap-2 font-medium text-foreground">
          <IconBasketDollar className="w-5 h-5 text-green-600" />
          Szczegóły kosztów
        </h3>

        {visibleServices.map((service) => {
          const finalized = costs?.[service] || [];

          const totalServiceCost = finalized.reduce((sum, c) => {
            const unit = Number(c.value || 0);
            const qty = Number(c.quantity || 1);
            const vatPct = Number(c.vat || 0);
            return sum + unit * qty * (1 + vatPct / 100);
          }, 0);

          return (
            <div key={service} className="p-4 border rounded-xl">
              <div className="flex justify-between items-baseline mb-3">
                <h4 className="flex items-center gap-2 font-medium text-foreground">
                  <IconChecklist className="w-4 h-4 text-primary" />
                  {idToTitleMap[service]}
                </h4>
                <span className="text-muted-foreground text-sm">
                  {finalized.length} {pluralize(finalized.length)}
                </span>
              </div>

              <div className="divide-y">
                {finalized.map((c, i) => {
                  const unit = Number(c.value || 0);
                  const qty = Number(c.quantity || 1);
                  const vatPct = Number(c.vat || 0);
                  const currency = c.currency || "";
                  const lineNet = unit * qty;
                  const lineGross = lineNet * (1 + vatPct / 100);
                  const isMaterial = c.type === "material";
                  const TypeIcon = isMaterial ? IconPackage : IconHammer;

                  return (
                    <div
                      key={`${service}-${i}`}
                      className="gap-2 grid grid-cols-1 sm:grid-cols-12 py-2"
                    >
                      <div className="flex flex-col gap-1 sm:col-span-8">
                        <div className="flex items-start gap-2">
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 ${
                              isMaterial
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {isMaterial ? "Materiał" : "Usługa"}
                          </Badge>
                          <span className="text-foreground">{c.label}</span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {qty} × {formatMoney(unit, currency)} • VAT {vatPct}%
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-4 sm:text-right">
                        <div className="font-medium text-foreground">
                          {formatMoney(lineGross, currency)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          netto {formatMoney(lineNet, currency)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Łączny koszt dla {idToTitleMap[service]}:
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <IconCurrencyDollar className="w-4 h-4 text-green-600" />
                    {formatMoney(
                      totalServiceCost,
                      (finalized[0] && finalized[0].currency) || ""
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Podsumowanie całościowe */}
      {allCosts.length > 0 && (
        <div className="bg-muted/40 p-4 border rounded-xl">
          <div className="flex justify-between items-baseline">
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <IconCurrencyDollar className="w-5 h-5 text-emerald-600" />
                Podsumowanie całościowe
              </h3>
              <p className="text-muted-foreground text-sm">
                Łączna wartość wszystkich pozycji
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 border-emerald-200 text-emerald-700"
                >
                  Materiały: {materialCount}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700"
                >
                  Usługi: {serviceCount}
                </Badge>
                <Badge variant="secondary" className="text-foreground">
                  Razem pozycji: {allCosts.length} {pluralize(allCosts.length)}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-foreground text-xl">
                {formatMoney(
                  grandTotal,
                  (allCosts[0] && allCosts[0].currency) || ""
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <ErrorText text={error} />}
    </div>
  );
}
