import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuthContext } from "@/state/auth-context";
import { IconPlus, IconDeviceFloppy } from "@tabler/icons-react";
import { DatePickerPopover } from "./ui/date-picker-popover";
import { EventTypeCombox } from "./event-type-combox";
import { CurrencyCombox } from "./currency-combox";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorText } from "@/components/error-text";
import { translateErrorCode } from "@/formatting/errors";
import { Label } from "@/components/ui/label";

export function AddEventForm({ vehicleId, fetchEvents, setShowForm }) {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    event_type: "",
    mileage: "",
    date: "",
    cost_amount: "",
    vat_rate: "",
    currency: "",
  });
  const [noCost, setNoCost] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  function isStep1Valid() {
    return (
      typeof formData.event_type === "string" &&
      formData.event_type.trim() !== "" &&
      typeof formData.mileage === "string" &&
      formData.mileage.trim() !== "" &&
      formData.date instanceof Date &&
      !isNaN(formData.date.getTime())
    );
  }

  const isStep2Valid = () => {
    if (noCost) return true;
    return (
      formData.cost_amount.trim() !== "" &&
      formData.vat_rate.trim() !== "" &&
      formData.currency.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isStep1Valid() || !isStep2Valid()) {
      setError("Wypełnij wszystkie wymagane pola.");
      return;
    }
    setError("");

    const payload = {
      event_type: formData.event_type,
      mileage: parseInt(formData.mileage),
      date: formData.date,
      ...(noCost
        ? {}
        : {
            cost_amount: formData.cost_amount,
            vat_rate: formData.vat_rate,
            currency: formData.currency,
          }),
    };

    try {
      const response = await fetch(`/api/v1/vehicles/${vehicleId}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Coś poszło nie tak. Spróbuj ponownie.";

        try {
          const data = await response.json();
          if (data?.error) {
            message = translateErrorCode(data.error);
          }
        } catch (_) {}
        throw new Error(message);
      }

      setShowForm(false);
      setFormData({
        event_type: "",
        mileage: "",
        date: "",
        cost_amount: "",
        vat_rate: "",
        currency: "",
      });
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <li className="flex flex-col ms-8 mb-8">
      <span className="absolute flex justify-center items-center rounded-full w-6 h-6 text-accent bg-accent-foreground -start-3">
        <IconPlus className="w-4" />
      </span>
      <h3 className="mb-2 font-medium text-sm">
        {formStep === 1 ? "Dodanie zdarzenia" : "Dodanie kosztu"}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-background p-4 border-1 rounded-xl"
      >
        {formStep === 1 && (
          <>
            <Label htmlFor="type">Typ zdarzenia</Label>
            <EventTypeCombox
              id="type"
              value={formData.event_type}
              onChange={(value) =>
                setFormData({ ...formData, event_type: value })
              }
            />
            <Label htmlFor="date">Data zdarzenia</Label>

            <DatePickerPopover
              id="date"
              value={formData.date}
              onChange={(newDate) =>
                setFormData({ ...formData, date: newDate })
              }
              text="Data zdarzenia"
            />
            <Label htmlFor="type">Przebieg</Label>
            <Input
              id="type"
              type="number"
              placeholder="Przebieg"
              value={formData.mileage}
              min="0"
              required
              onChange={(e) =>
                setFormData({ ...formData, mileage: e.target.value })
              }
            />
          </>
        )}
        {formStep === 2 && (
          <>
            <Input
              type="number"
              placeholder="Kwota"
              value={formData.cost_amount}
              min="0"
              required={!noCost}
              onChange={(e) =>
                setFormData({ ...formData, cost_amount: e.target.value })
              }
              disabled={noCost}
            />
            <Input
              type="number"
              placeholder="Stawka VAT (%)"
              value={formData.vat_rate}
              min="0"
              max="100"
              required={!noCost}
              onChange={(e) =>
                setFormData({ ...formData, vat_rate: e.target.value })
              }
              disabled={noCost}
            />
            <CurrencyCombox
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e })}
              disabled={noCost}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noCost"
                checked={noCost}
                onCheckedChange={(e) => {
                  setNoCost(e);
                  setFormData({
                    ...formData,
                    currency: "",
                    cost_amount: "",
                    vat_rate: "",
                  });
                }}
              />
              <label
                htmlFor="noCost"
                className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
              >
                Zdarzenie bezkosztowe
              </label>
            </div>
          </>
        )}
        {error && <ErrorText text={error} />}
        <div className="flex justify-between">
          {formStep > 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => setFormStep(formStep - 1)}
              >
                Wstecz
              </Button>
              <Button type="submit">
                <IconDeviceFloppy />
                Zapisz zdarzenie
              </Button>
            </>
          )}
          {formStep < 2 && (
            <>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Anuluj
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (isStep1Valid()) {
                    setFormStep(formStep + 1);
                    setError("");
                  } else {
                    setError("Wypełnij wszystkie wymagane pola.");
                  }
                }}
              >
                Dalej
              </Button>
            </>
          )}
        </div>
      </form>
    </li>
  );
}
