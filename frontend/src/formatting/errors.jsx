export function translateErrorCode(code) {
  const messages = {
    vehicle_id_required: "Brak pojazdu",
    event_type_id_required: "Wybierz typ",
    negative_event_mileage: "Przebieg nie może być ujemny",
    future_event_date: "Zdarzenie nie może mieć przyszłej daty",
    vehicle_check_failed: "Błąd sprawdzenia pojazdu",
    vehicle_not_found: "Pojazd nie istnieje",
    event_type_check_failed: "Błąd sprawdzenia typu",
    event_type_not_found: "Typ nie istnieje",
    last_event_fetch_failed: "Błąd kontroli historii pojazdu",
    event_mileage_regression: "Przebieg nie może być niższy niż ten z ostatniego zdarzenia",
    cost_check_failed: "Błąd sprawdzenia kosztu",
    cost_not_found: "Koszt nie istnieje",
  };

  return messages[code] || "Wystąpił nieznany błąd. Spróbuj ponownie później";
}
