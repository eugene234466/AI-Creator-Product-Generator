import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Product Intelligence",
  description: "Find monetizable opportunities from creators and turn them into digital products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
