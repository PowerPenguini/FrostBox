import { SiteHeader } from "@/components/site-header";
import { RevenueDocumentsDataProvider } from "@/state/revenues-documents-data-context";

export default function RootLayout({ children }) {
  return <><SiteHeader title="Dokumenty przychodowe" /><RevenueDocumentsDataProvider>{children}</RevenueDocumentsDataProvider></>;
}
