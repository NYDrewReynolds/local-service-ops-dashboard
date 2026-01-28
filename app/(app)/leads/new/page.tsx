"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { createLead, Lead } from "@/lib/api";

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

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Lead>>(emptyLead);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createLead(form);
      router.push("/leads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/leads" className="text-sm text-muted-foreground underline">
          Back to leads
        </Link>
        <div>
          <h2 className="text-2xl font-semibold">New Lead</h2>
          <p className="text-sm text-muted-foreground">
            Capture a new lead for planning and execution.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
          <CardDescription>Provide the customer and request info.</CardDescription>
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
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/leads">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Lead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
