import { CostsDataProvider } from "@/state/costs-data-context";

export default function RootLayout({ children }) {
  return <CostsDataProvider>{children}</CostsDataProvider>;
}
