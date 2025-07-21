import { RevenuesDataProvider } from "@/state/revenues-data-context";
import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }) {
  return <><SiteHeader title="Przychody" /><RevenuesDataProvider>{children}</RevenuesDataProvider></>;
}
