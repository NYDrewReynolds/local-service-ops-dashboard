"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  Database,
  Home,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getJobs, getLeads, getSubcontractors, Lead } from "@/lib/api";

type Job = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_window_start: string;
  scheduled_window_end: string;
  assignments?: Array<{
    subcontractor?: { name: string };
  }>;
};

type Subcontractor = {
  id: string;
  name: string;
  phone: string;
  service_codes: string[];
};

const navItems = [
  { href: "/leads", label: "Leads", icon: ClipboardList },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/subcontractors", label: "Subcontractors", icon: Users },
];

const demoItems = [{ href: "/demo", label: "Demo Data", icon: Database }];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);

  const searchTerm = query.trim().toLowerCase();

  useEffect(() => {
    if (searchTerm.length < 2) {
      setLeads([]);
      setJobs([]);
      setSubcontractors([]);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [leadResults, jobResults, subcontractorResults] =
          await Promise.all([getLeads(), getJobs(), getSubcontractors()]);
        setLeads(leadResults);
        setJobs(jobResults);
        setSubcontractors(subcontractorResults);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredLeads = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return leads.filter((lead) =>
      [lead.full_name, lead.service_requested, lead.status, lead.urgency_hint]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchTerm))
    );
  }, [leads, searchTerm]);

  const filteredJobs = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return jobs.filter((job) =>
      [
        job.status,
        job.scheduled_date,
        job.scheduled_window_start,
        job.scheduled_window_end,
        job.assignments?.[0]?.subcontractor?.name,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchTerm))
    );
  }, [jobs, searchTerm]);

  const filteredSubcontractors = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return subcontractors.filter((sub) =>
      [sub.name, sub.phone, sub.service_codes.join(" ")]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchTerm))
    );
  }, [subcontractors, searchTerm]);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
              <Home className="size-4" />
              <span className="text-sm font-semibold">Local Service Ops</span>
            </div>
          </div>
          <Button asChild size="sm" className="w-full justify-start">
            <Link href="/leads/new">
              <Plus className="size-4" />
              Quick Create
            </Link>
          </Button>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workflow</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Demo</SidebarGroupLabel>
            <SidebarMenu>
              {demoItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b border-border px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              placeholder="Search leads, jobs, subcontractors..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {searchTerm.length >= 2 && (
              <div className="absolute left-0 right-0 top-11 z-20 rounded-md border border-border bg-popover p-4 shadow-lg">
                {searching ? (
                  <p className="text-sm text-muted-foreground">Searching...</p>
                ) : (
                  <div className="grid gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Leads
                      </p>
                      {filteredLeads.length === 0 ? (
                        <p className="mt-2 text-muted-foreground">No leads found.</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {filteredLeads.slice(0, 5).map((lead) => (
                            <li key={lead.id}>
                              <Link
                                href={`/leads/${lead.id}`}
                                className="block rounded-md px-2 py-1 hover:bg-muted"
                              >
                                <span className="font-medium">{lead.full_name}</span>{" "}
                                <span className="text-muted-foreground">
                                  · {lead.service_requested}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Jobs
                      </p>
                      {filteredJobs.length === 0 ? (
                        <p className="mt-2 text-muted-foreground">No jobs found.</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {filteredJobs.slice(0, 5).map((job) => (
                            <li key={job.id}>
                              <Link
                                href={`/jobs/${job.id}`}
                                className="block rounded-md px-2 py-1 hover:bg-muted"
                              >
                                <span className="font-medium">{job.status}</span>{" "}
                                <span className="text-muted-foreground">
                                  · {job.scheduled_date} {job.scheduled_window_start}-
                                  {job.scheduled_window_end}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Subcontractors
                      </p>
                      {filteredSubcontractors.length === 0 ? (
                        <p className="mt-2 text-muted-foreground">
                          No subcontractors found.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {filteredSubcontractors.slice(0, 5).map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href="/subcontractors"
                                className="block rounded-md px-2 py-1 hover:bg-muted"
                              >
                                <span className="font-medium">{sub.name}</span>{" "}
                                <span className="text-muted-foreground">
                                  · {sub.phone}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button asChild size="sm">
            <Link href="/leads">
              <Plus className="size-4" />
              New Lead
            </Link>
          </Button>
        </header>
        <main className="flex-1 bg-background p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
