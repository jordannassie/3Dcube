import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOWER Umar Strategy Lab",
  description:
    "Local MBO backtesting and optimization platform for the Umar / Level 2 order-flow strategy on NQ futures.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen ambient-mesh grid-overlay antialiased">
        <div className="scanline" aria-hidden />
        {children}
      </body>
    </html>
  );
}
