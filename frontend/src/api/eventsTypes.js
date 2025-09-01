import { translateErrorCode } from "@/formatting/errors";

export async function DeleteEventType(id, token) {
  const res = await fetch(`/api/v1/events/types/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.error
      ? translateErrorCode(data.error)
      : "Nie udało się usunąć typu zdarzenia.";
    throw new Error(message);
  }
}

export async function FetchEventTypes(token) {
  const url = `/api/v1/events/types`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.error
      ? translateErrorCode(data.error)
      : "Nie udało się pobrać listy typów zdarzeń.";
    throw new Error(message);
  }

  return res.json();
}
