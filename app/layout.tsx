import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "West Lafayette Lawn Care & Instant Pricing | GreenBlade",
  description:
    "Build a transparent lawn-care quote and send a service request to a local GreenBlade professional.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
