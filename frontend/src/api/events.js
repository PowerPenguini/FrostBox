import { translateErrorCode } from "@/formatting/errors";

export async function AddVehicleEvents(eventData, id, token) {
  const res = await fetch(`/api/v1/vehicles/${id}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.error
      ? translateErrorCode(data.error)
      : "Nie udało się dodać zdarzenia.";
    throw new Error(message);
  }

  return res.json();
}
