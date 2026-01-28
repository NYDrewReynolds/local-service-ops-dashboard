"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
          <button
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
            onClick={handleDemo}
            disabled={submitting}
          >
            Populate Demo Data
          </button>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">New Lead</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="flex flex-col text-sm text-slate-300">
              <span className="capitalize">{key.replaceAll("_", " ")}</span>
              <input
                className="mt-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                value={value ?? ""}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            </label>
          ))}
          <div className="md:col-span-2 flex justify-end">
            <button
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950"
              type="submit"
              disabled={submitting}
            >
              Create Lead
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold">Lead Queue</h3>
        </div>
        <div className="px-6 py-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading leads...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Service</th>
                  <th className="py-2">Urgency</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-800">
                    <td className="py-3 font-medium text-slate-100">
                      <Link href={`/leads/${lead.id}`} className="hover:underline">
                        {lead.full_name}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-300">
                      {lead.service_requested}
                    </td>
                    <td className="py-3 text-slate-300">{lead.urgency_hint}</td>
                    <td className="py-3 text-slate-300">{lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
