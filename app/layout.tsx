import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Store POS | Self-Service Kiosk",
  description:
    "Touchscreen self-service point of sale kiosk for a campus food and merchandise outlet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
