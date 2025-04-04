import {
  IconRoad,
  IconDropletPlus,
  IconGasStation
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge";

const mnemonics = {
  toll: { name: "Opłata drogowa", icon: IconRoad },
  additive: { name: "Dodatki", icon: IconDropletPlus },
  fuel: { name: "Paliwo", icon: IconGasStation },
};

export function translateCostCategory(category) {
  return mnemonics[category] ? mnemonics[category].name : "Inne";
}

export function renderCostCategory(category) {
  const { icon: Icon, name } = mnemonics[category] || {
    icon: null,
    name: translateCostCategory(category),
  };

  return (
    <Badge variant="outline" className="text-muted-foreground px-1.5">
      {Icon && <Icon />} {name}
    </Badge>
  );
}
