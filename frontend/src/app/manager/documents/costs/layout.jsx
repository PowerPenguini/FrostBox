import { CostDocumentsDataProvider } from "@/state/cost-documents-data-context";
import { VehiclesDataProvider } from "@/state/vehicles-data-context";

export default function RootLayout({ children }) {
  return <CostDocumentsDataProvider>{children}</CostDocumentsDataProvider>;
}
