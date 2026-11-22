import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantum Finance | Sovereign Digital Asset Security",
  description:
    "Explore QFS, a quantum-resilient financial ecosystem for digital asset security and cross-ledger messaging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
