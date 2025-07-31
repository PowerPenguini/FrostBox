import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }) {
  return <><SiteHeader title="Ustawienia" />{children}</>;
}
