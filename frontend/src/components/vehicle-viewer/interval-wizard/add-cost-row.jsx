import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyCombox } from "@/components/currency-combox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function AddCostRow({ serviceId, index, cost, updateCost, onOk, onCancel }) {
  return (
    <div className="flex flex-col gap-4 bg-background p-3 border rounded-lg">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Typ kosztu</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            defaultValue="material"
            value={cost.type}
            onValueChange={(val) =>
              updateCost(serviceId, index, "type", val)
            }
          >
            <ToggleGroupItem value="material">Materiał</ToggleGroupItem>
            <ToggleGroupItem value="service">Usługa</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col flex-1 gap-2">
          <Label htmlFor="title">Tytuł</Label>
          <Input
            id="title"
            placeholder="Opłata drogowa"
            value={cost.label}
            onChange={(e) =>
              updateCost(serviceId, index, "label", e.target.value)
            }
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col flex-1 gap-2">
          <Label htmlFor="value">Koszt (netto)</Label>
          <Input
            type="number"
            id="value"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={cost.value}
            onChange={(e) =>
              updateCost(serviceId, index, "value", e.target.value)
            }
          />
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <Label htmlFor="currency">Waluta</Label>
          <CurrencyCombox
            id="currency"
            value={cost.currency}
            onChange={(val) => updateCost(serviceId, index, "currency", val)}
          />
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <Label htmlFor="vat">Stawka VAT (%)</Label>
          <Input
            type="number"
            id="vat"
            placeholder="0"
            min="0"
            max="100"
            value={cost.vat}
            onChange={(e) =>
              updateCost(serviceId, index, "vat", e.target.value)
            }
          />
        </div>
      </div>

      <Label htmlFor="quantity">Ilość</Label>
      <Input
        type="number"
        id="quantity"
        placeholder="1"
        min="0"
        value={cost.quantity}
        onChange={(e) =>
          updateCost(serviceId, index, "quantity", e.target.value)
        }
      />

      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={() => onOk(serviceId, index)}>
          Zapisz
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCancel(serviceId, index)}
        >
          Anuluj
        </Button>
      </div>
    </div>
  );
}
