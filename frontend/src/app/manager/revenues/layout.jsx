import { CostsDataProvider } from "@/state/costs-data-context";
import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }) {
  return <><SiteHeader title="Przychody" /><CostsDataProvider>{children}</CostsDataProvider></>;
}
