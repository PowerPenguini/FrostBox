export async function getVehicleIntervals(vehicleId, token) {
  const res = await fetch(`/api/v1/vehicles/${vehicleId}/intervals`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Nie udało się pobrać interwałów");
  }

  return await res.json();
}

export async function deleteInterval(intervalId, token) {
  const res = await fetch(`/api/v1/intervals/${intervalId}`, {
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
      : "Coś poszło nie tak. Spróbuj ponownie.";
    throw new Error(message);
  }
}
