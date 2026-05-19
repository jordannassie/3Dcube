import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOWER Strategy Lab",
  description:
    "Upload NinjaTrader indicators. Build backtestable strategies. Optimize with MBO data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
