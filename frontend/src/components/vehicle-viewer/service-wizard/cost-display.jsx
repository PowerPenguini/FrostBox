import { Badge } from "@/components/ui/badge";
import { IconHammer, IconPackage } from "@tabler/icons-react";

export function CostDisplay({ label, value, currency, vat, quantity, type }) {
  const costTypeLabels = {
    material: "Materiał",
    service: "Usługa",
  };

  const safeValue = Number(value) || 0;
  const safeVat = Number(vat) || 0;
  const safeQuantity = Number(quantity) || 1;

  const totalValue = (safeValue * safeQuantity * (1 + safeVat / 100)).toFixed(2);
  const typeLabel = costTypeLabels[type] || type;

  const isMaterial = type === "material";
  const TypeIcon = isMaterial ? IconPackage : IconHammer;

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isMaterial
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <TypeIcon className="w-3 h-3" />
            {typeLabel}
          </Badge>
          <span className="font-medium text-foreground">{label}</span>
        </div>

        <div className="text-muted-foreground text-sm">
          {safeValue.toFixed(2)} {currency} × {safeQuantity} • VAT {safeVat}% ={" "}
          <span className="ml-1 font-semibold text-foreground">
            {totalValue} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
