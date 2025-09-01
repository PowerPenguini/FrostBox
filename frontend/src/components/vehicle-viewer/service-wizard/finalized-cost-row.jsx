import { Button } from "@/components/ui/button";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CostDisplay } from "@/components/vehicle-viewer/service-wizard/cost-display";

export function FinalizedCostRow({ serviceId, index, cost, onDelete, onEdit }) {
  return (
    <div className="flex justify-between items-center bg-muted/50 p-3 border rounded-lg">
      <div className="flex-1">
        <CostDisplay
          label={cost.label}
          value={cost.value}
          currency={cost.currency}
          vat={cost.vat}
          quantity={cost.quantity}
          type={cost.type}
        />
      </div>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(serviceId, index)}
              >
                <IconEdit />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edytuj koszt</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => onDelete(serviceId, index)}
              >
                <IconTrash className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Usuń koszt</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
