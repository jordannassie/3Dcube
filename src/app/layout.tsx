import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Cube",
  description: "An interactive 3D cube experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
