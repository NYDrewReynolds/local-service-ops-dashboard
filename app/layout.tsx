import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Service Ops",
  description: "Admin dashboard for autonomous local service ops",
};

const navLinks = [
  { href: "/leads", label: "Leads" },
  { href: "/jobs", label: "Jobs" },
  { href: "/subcontractors", label: "Subcontractors" },
  { href: "/demo", label: "Demo" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">
            <h1 className="text-lg font-semibold">Local Service Ops</h1>
            <p className="mt-2 text-sm text-slate-400">
              MVP admin workflow
            </p>
            <Separator className="my-6" />
            <nav className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={buttonVariants({
                    variant: "ghost",
                    className:
                      "w-full justify-start text-slate-200 hover:text-slate-100",
                  })}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 bg-slate-950 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
