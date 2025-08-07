export async function deleteEventType(id, token) {
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