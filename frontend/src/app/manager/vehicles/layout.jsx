import { VehiclesDataProvider } from "@/state/vehicles-data-context";
import { SiteHeader } from "@/components/site-header";
export default function RootLayout({ children }) {
  return (
    <>
      <SiteHeader title="Pojazdy" />
      <VehiclesDataProvider>{children}</VehiclesDataProvider>
    </>
  );
}
