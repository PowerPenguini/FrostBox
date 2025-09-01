import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerPopover } from "@/components/ui/date-picker-popover";
import { ErrorText } from "@/components/error-text";

export function InfoStep({
  serviceDate,
  setServiceDate,
  serviceMileage,
  setServiceMileage,
  error
}) {
  return (
    <div className="flex flex-col gap-4" >
      <Label htmlFor="revenueDate">Data serwisu</Label>
      <DatePickerPopover
        id="revenueDate"
        value={serviceDate}
        onChange={setServiceDate}
      />
      <Label htmlFor="mileage">Przebieg podczas serwisu</Label>
      <Input
        id="mileage"
        type="number"
        placeholder="Przebieg"
        min="0"
        required
        value={serviceMileage}
        onChange={(e) => setServiceMileage(e.target.value)}
      />
      {error && <ErrorText text={error}/>}
    </div>
  );
}
