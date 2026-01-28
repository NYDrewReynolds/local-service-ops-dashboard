"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  AgentRunResult,
  getLead,
  getPricingRules,
  getSubcontractors,
  getTimeline,
  runAgent,
  Lead,
} from "@/lib/api";

type PricingRule = {
  id: string;
  service_code: string;
  min_price_cents: number;
  max_price_cents: number;
  base_price_cents: number;
};

type Subcontractor = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  service_codes: string[];
  subcontractor_availabilities: Array<{
    id: string;
    day_of_week: number;
    window_start: string;
    window_end: string;
  }>;
};

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [timeline, setTimeline] = useState<Array<Record<string, unknown>>>([]);
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [leadData, pricingData, subcontractorData, timelineData] =
        await Promise.all([
          getLead(params.id),
          getPricingRules(),
          getSubcontractors(),
          getTimeline(params.id),
        ]);
      setLead(leadData);
      setPricingRules(pricingData);
      setSubcontractors(subcontractorData);
      setTimeline(timelineData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleRunAgent = async (mode: "plan_only" | "execute") => {
    setLoading(true);
    try {
      const result = await runAgent(params.id, mode);
      setAgentResult(result);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !lead) {
    return <p className="text-sm text-muted-foreground">Loading lead...</p>;
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link href="/leads" className="text-sm text-muted-foreground underline">
          Back to leads
        </Link>
        <p className="text-sm text-muted-foreground">Lead not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/leads" className="text-sm text-muted-foreground underline">
            Back to leads
          </Link>
          <h2 className="text-2xl font-semibold">{lead.full_name}</h2>
          <p className="text-sm text-muted-foreground">{lead.service_requested}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleRunAgent("plan_only")}
            disabled={loading}
          >
            Run Agent (Plan Only)
          </Button>
          <Button onClick={() => handleRunAgent("execute")} disabled={loading}>
            Run Agent (Execute)
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>Contact + request summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm text-muted-foreground">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-foreground">{lead.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="text-foreground">{lead.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="text-foreground">
                  {lead.address_line1}, {lead.city}, {lead.state}{" "}
                  {lead.postal_code}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Urgency</dt>
                <dd className="text-foreground">{lead.urgency_hint || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={lead.status === "failed" ? "destructive" : "secondary"}>
                    {lead.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="text-foreground">{lead.notes || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
            <CardDescription>Guardrails applied to quotes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pricingRules.map((rule) => (
                <li key={rule.id}>
                  <span className="font-medium text-foreground">
                    {rule.service_code}
                  </span>{" "}
                  — min {rule.min_price_cents} / max {rule.max_price_cents} / base{" "}
                  {rule.base_price_cents}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Subcontractors</CardTitle>
          <CardDescription>Read-only coverage list.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {subcontractors.map((sub) => (
              <Card key={sub.id}>
                <CardHeader>
                  <CardTitle className="text-base">{sub.name}</CardTitle>
                  <CardDescription>{sub.phone}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">
                  Services: {sub.service_codes.join(", ")}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Output</CardTitle>
          <CardDescription>Latest plan + execution results.</CardDescription>
        </CardHeader>
        <CardContent>
          {agentResult ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-border bg-muted p-4">
                <p className="text-xs text-muted-foreground">Plan JSON</p>
                <pre className="mt-2 max-h-80 overflow-auto text-xs text-foreground">
                  {JSON.stringify(agentResult.plan, null, 2)}
                </pre>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-muted-foreground">Quote</p>
                  <pre className="rounded-md border border-border bg-muted p-3 text-xs text-foreground">
                    {JSON.stringify(agentResult.quote, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-muted-foreground">Job</p>
                  <pre className="rounded-md border border-border bg-muted p-3 text-xs text-foreground">
                    {JSON.stringify(agentResult.job, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-muted-foreground">Assignment</p>
                  <pre className="rounded-md border border-border bg-muted p-3 text-xs text-foreground">
                    {JSON.stringify(agentResult.assignment, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-muted-foreground">Notification</p>
                  <pre className="rounded-md border border-border bg-muted p-3 text-xs text-foreground">
                    {JSON.stringify(agentResult.notification, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run the agent to view the plan and generated records.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Timeline</CardTitle>
          <CardDescription>Agent + execution activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {timeline.map((event) => (
              <li
                key={`${event.type}-${event.id}`}
                className="rounded-md border border-border bg-muted p-3"
              >
                <p className="text-xs uppercase text-muted-foreground">
                  {event.type}
                </p>
                <pre className="mt-2 text-xs text-foreground">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
