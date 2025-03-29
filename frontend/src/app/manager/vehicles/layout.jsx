import { VehiclesDataProvider } from "@/state/vehicles-data-context";

export default function RootLayout({ children }) {
  return <VehiclesDataProvider>{children}</VehiclesDataProvider>;
}
