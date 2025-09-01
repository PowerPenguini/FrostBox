import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function ServiceItem({ title, description, checked, onToggle }) {
  return (
    <Label className="flex items-start gap-3 has-[[aria-checked=true]]:bg-blue-50 hover:bg-accent/50 dark:has-[[aria-checked=true]]:bg-blue-950 p-3 border has-[[aria-checked=true]]:border-blue-600 dark:has-[[aria-checked=true]]:border-blue-900 rounded-lg">
      <Checkbox
        id={title}
        checked={checked}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-blue-700 data-[state=checked]:text-white"
      />
      <div className="gap-1.5 grid font-normal">
        <p className="font-medium text-sm leading-none">{title}</p>
        <p className="text-muted-foreground text-sm">{description || ""}</p>
      </div>
    </Label>
  );
}
