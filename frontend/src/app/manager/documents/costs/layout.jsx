import { CostDocumentsDataProvider } from "@/state/cost-documents-data-context";
import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }) {
  return <><SiteHeader title="Dokumenty kosztowe" /><CostDocumentsDataProvider>{children}</CostDocumentsDataProvider></>;
}
