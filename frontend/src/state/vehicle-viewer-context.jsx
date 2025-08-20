import { createContext, useContext, useState } from "react";

const VehicleViewerContext = createContext(null);

export function VehicleViewerProvider({ children }) {
  const [views, setViews] = useState(["Rentowność"]);
  const active = views[views.length - 1];

  const goTo = (name) => setViews([name]);
  const push = (name) => setViews((v) => [...v, name]);
  const pop = () => setViews((v) => v.slice(0, -1));
  const jump = (i) => setViews((v) => v.slice(0, i + 1));

  return (
    <VehicleViewerContext.Provider
      value={{ active, views, goTo, push, pop, jump }}
    >
      {children}
    </VehicleViewerContext.Provider>
  );
}

export function useVehicleViewer() {
  const ctx = useContext(VehicleViewerContext);
  if (!ctx)
    throw new Error(
      "useVehicleViewer must be used within a VehicleViewerProvider",
    );
  return ctx;
}
