"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLeads, populateDemo, Lead } from "@/lib/api";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const showDemo = process.env.NODE_ENV !== "production";

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleDemo = async () => {
    setSubmitting(true);
    try {
      await populateDemo();
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to populate demo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Leads</h2>
          <p className="text-sm text-muted-foreground">
            Intake, plan, and execution workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showDemo && (
            <Button variant="outline" onClick={handleDemo} disabled={submitting}>
              Populate Demo Data
            </Button>
          )}
          <Button asChild>
            <Link href="/leads/new">Create Lead</Link>
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lead Queue</CardTitle>
          <CardDescription>Most recent lead intake (showing 10).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading leads...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.slice(0, 10).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <Link href={`/leads/${lead.id}`} className="hover:underline">
                        {lead.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.service_requested}</TableCell>
                    <TableCell>{lead.urgency_hint || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={lead.status === "failed" ? "outline" : "secondary"}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
