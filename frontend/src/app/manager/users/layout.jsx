import { UsersDataProvider } from "@/state/users-data-context";

export default function RootLayout({ children }) {
  return <UsersDataProvider>{children}</UsersDataProvider>;
}
