import { UsersDataProvider } from "@/state/users-data-context";
import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }) {
  return <><SiteHeader title="Użytkownicy" /><UsersDataProvider>{children}</UsersDataProvider></>;
}
