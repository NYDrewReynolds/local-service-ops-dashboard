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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLead, getLeads, populateDemo, Lead } from "@/lib/api";

const emptyLead: Partial<Lead> = {
  full_name: "",
  email: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  service_requested: "",
  notes: "",
  urgency_hint: "",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState<Partial<Lead>>(emptyLead);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const showDemo = process.env.NODE_ENV !== "production";

  const fields = [
    { key: "full_name", label: "Full name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address_line1", label: "Address line 1" },
    { key: "address_line2", label: "Address line 2" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "postal_code", label: "Postal code" },
    { key: "service_requested", label: "Service requested" },
    { key: "notes", label: "Notes" },
    { key: "urgency_hint", label: "Urgency hint" },
  ] as const;

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createLead(form);
      setForm(emptyLead);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="text-sm text-slate-400">
            Intake, plan, and execution workflow.
          </p>
        </div>
        {showDemo && (
          <Button onClick={handleDemo} disabled={submitting}>
            Populate Demo Data
          </Button>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Lead</CardTitle>
          <CardDescription>Capture a new lead for planning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  value={(form as Record<string, string | undefined>)[field.key] ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, [field.key]: event.target.value })
                  }
                />
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={submitting}>
                Create Lead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Queue</CardTitle>
          <CardDescription>Most recent lead intake.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Loading leads...</p>
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
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <Link href={`/leads/${lead.id}`} className="hover:underline">
                        {lead.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.service_requested}</TableCell>
                    <TableCell>{lead.urgency_hint || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={lead.status === "failed" ? "danger" : "default"}>
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
