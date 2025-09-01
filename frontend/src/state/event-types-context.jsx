// EventTypesContext.js
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { FetchEventTypes } from "@/api/eventsTypes";
import { useAuthContext } from "@/state/auth-context";

const EventTypesContext = createContext({
  loading: true,
  eventTypes: [],
  error: null,
  fetchEventTypes: () => {},
  idToTitleMap: {},
});

export function EventTypesProvider({ children }) {
  const { token } = useAuthContext();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await FetchEventTypes(token);
      setEventTypes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const idToTitleMap = useMemo(() => {
    const map = {};
    for (const ev of eventTypes) {
      map[ev.id] = ev.name;
    }
    return map;
  }, [eventTypes]);

  return (
    <EventTypesContext.Provider
      value={{ loading, eventTypes, error, fetchEventTypes: loadData, idToTitleMap }}
    >
      {children}
    </EventTypesContext.Provider>
  );
}

export function useEventTypes() {
  return useContext(EventTypesContext);
}
