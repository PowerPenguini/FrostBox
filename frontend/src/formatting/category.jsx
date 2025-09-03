import {
  IconRoad,
  IconDropletPlus,
  IconGasStation,
  IconNut,
  IconFileDescription,
  IconBucketDroplet
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge";

const mnemonics = {
  toll: { name: "Opłata drogowa", icon: IconRoad },
  additive: { name: "Dodatki", icon: IconDropletPlus },
  fuel: { name: "Paliwo", icon: IconGasStation },
  service_labour: { name: "Serwis - usługa", icon: IconNut },
  service_material: { name: "Serwis - materiał", icon: IconNut },
  administrative: { name: "Administracyjne", icon: IconFileDescription },
  maintenance: { name: "Gospodarcze", icon: IconBucketDroplet },
};

export function translateCategory(category) {
  return mnemonics[category] ? mnemonics[category].name : "Inne";
}

export function renderCategory(category) {
  const { icon: Icon, name } = mnemonics[category] || {
    icon: null,
    name: translateCategory(category),
  };

  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      {Icon && <Icon />} {name}
    </Badge>
  );
}
