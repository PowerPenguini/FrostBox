import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";
import { Badge } from "./badge";

const statusConfig = {
  added: {
    icon: IconCircleCheckFilled,
    className: "fill-green-500 dark:fill-green-400",
    label: "Dodany",
  },
  withdrawn: {
    icon: IconCircleXFilled,
    className: "fill-red-700",
    label: "Wycofany",
  },
  incorrect: {
    icon: IconAlertTriangleFilled,
    className: "fill-amber-600",
    label: "Nieprawidłowy",
  },
};

export const StatusBadge = ({ status, className = "" }) => {
  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`px-1.5 text-muted-foreground ${className}`}
    >
      <Icon className={`${config.className} w-4 h-4 mr-1`} />
      {config.label}
    </Badge>
  );
};
