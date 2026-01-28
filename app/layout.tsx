import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Service Ops",
  description: "Admin dashboard for autonomous local service ops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
