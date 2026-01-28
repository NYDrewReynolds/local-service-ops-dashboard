"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { populateDemo, resetDemo } from "@/lib/api";

export default function DemoPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  const handlePopulate = async () => {
    setLoading(true);
    setError(null);
    try {
      await populateDemo();
      setMessage("Demo data populated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to populate demo");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      await resetDemo();
      setMessage("Demo data reset.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Demo Data</h2>
        <p className="text-sm text-slate-400">
          Creates sample services, subcontractors, pricing rules, and leads using
          synthetic data.
        </p>
      </header>

      {message && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seed Contents</CardTitle>
          <CardDescription>What will be created.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-300">
            <li>3 services (removal, trimming, stump grinding)</li>
            <li>3 subcontractors with availability and base rates</li>
            <li>Simple pricing rules per service</li>
            <li>5 sample leads with varying urgency</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handlePopulate} disabled={loading || isProd}>
          Populate Demo Data
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={loading || isProd}>
          Reset Demo Data
        </Button>
      </div>

      {isProd && (
        <p className="text-xs text-slate-500">
          Demo actions are disabled in production.
        </p>
      )}
    </div>
  );
}
