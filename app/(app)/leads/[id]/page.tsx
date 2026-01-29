"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  getJobs,
  getTimeline,
  runAgent,
  Lead,
} from "@/lib/api";
import ActivityTimeline from "@/components/activity-timeline";

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

type Job = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_window_start: string;
  scheduled_window_end: string;
  lead_id: string;
  assignments?: Array<{ status: string }>;
};

export default function LeadDetailPage() {
  const params = useParams<{ id?: string }>();
  const leadId =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [lead, setLead] = useState<Lead | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [timeline, setTimeline] = useState<Array<Record<string, unknown>>>([]);
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!leadId || leadId === "undefined") {
      setError("Missing lead id.");
      setLoading(false);
      return;
    }

    try {
      const [leadData, pricingData, subcontractorData, timelineData, jobsData] =
        await Promise.all([
          getLead(leadId),
          getPricingRules(),
          getSubcontractors(),
          getTimeline(leadId),
          getJobs(),
        ]);
      setLead(leadData);
      setPricingRules(pricingData);
      setSubcontractors(subcontractorData);
      setJobs(jobsData.filter((job: Job) => job.lead_id === leadId));
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
  }, [leadId]);

  const handleRunAgent = async (mode: "plan_only" | "execute") => {
    if (!leadId || leadId === "undefined") {
      setError("Missing lead id.");
      return;
    }

    setLoading(true);
    try {
      const result = await runAgent(leadId, mode);
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

  const plan = agentResult?.plan as
    | {
        service_code?: string;
        urgency_level?: string;
        quote?: { total_cents?: number };
        schedule?: { date?: string; window_start?: string; window_end?: string };
        subcontractor_id?: string | null;
        customer_message?: string;
        confidence?: number;
      }
    | undefined;

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const subcontractorNameById = subcontractors.reduce<Record<string, string>>(
    (acc, sub) => {
      acc[sub.id] = sub.name;
      return acc;
    },
    {}
  );

  const activeAssignment = jobs.some((job) =>
    job.assignments?.some((assignment) =>
      ["assigned", "confirmed"].includes(assignment.status)
    )
  );

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={() => handleRunAgent("execute")}
                    disabled={loading || activeAssignment}
                  >
                    Run Agent (Execute)
                  </Button>
                </span>
              </TooltipTrigger>
              {activeAssignment && (
                <TooltipContent>
                  Lead already assigned
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
                  <Badge variant={lead.status === "failed" ? "outline" : "secondary"}>
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
          <CardTitle>Jobs</CardTitle>
          <CardDescription>Jobs created for this lead.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {jobs.length === 0 ? (
            <p>No jobs created yet.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="rounded-md border border-border bg-muted p-3">
                <p className="text-foreground">
                  {job.scheduled_date} {job.scheduled_window_start}-{job.scheduled_window_end}{" "}
                  ET
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{job.status}</Badge>
                  <Link href={`/jobs/${job.id}`} className="text-foreground underline">
                    View job
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Output</CardTitle>
          <CardDescription>Latest plan + execution results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {agentResult ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plan Summary</CardTitle>
                  <CardDescription>Readable view of the agent plan.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Service</p>
                    <p className="text-foreground">{plan?.service_code || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Urgency</p>
                    <p className="text-foreground">{plan?.urgency_level || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Total</p>
                    <p className="text-foreground">
                      {plan?.quote?.total_cents
                        ? currency.format(plan.quote.total_cents / 100)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Confidence</p>
                    <p className="text-foreground">
                      {plan?.confidence ? `${Math.round(plan.confidence * 100)}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Schedule</p>
                    <p className="text-foreground">
                      {plan?.schedule?.date || "—"}{" "}
                      {plan?.schedule?.window_start
                        ? `${plan.schedule.window_start}-${plan.schedule.window_end} ET`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Subcontractor</p>
                    <p className="text-foreground">
                      {plan?.subcontractor_id
                        ? subcontractorNameById[plan.subcontractor_id] ||
                          plan.subcontractor_id
                        : "—"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase text-muted-foreground">Customer Message</p>
                    <p className="text-foreground">{plan?.customer_message || "—"}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quote</CardTitle>
                    <CardDescription>Generated pricing record.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    {agentResult.quote ? (
                      <>
                        <p className="text-foreground">
                          {currency.format(
                            Number((agentResult.quote as any).total_cents || 0) / 100
                          )}
                        </p>
                        {(agentResult.quote as any).id && (
                          <Link
                            href={`/quotes/${(agentResult.quote as any).id}`}
                            className="text-foreground underline"
                          >
                            View quote
                          </Link>
                        )}
                      </>
                    ) : (
                      <p>Run Execute to create a quote.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job</CardTitle>
                    <CardDescription>Scheduled job record.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    {agentResult.job ? (
                      <>
                        <p className="text-foreground">
                          {(agentResult.job as any).scheduled_date || "—"}{" "}
                          {(agentResult.job as any).scheduled_window_start || ""}-
                          {(agentResult.job as any).scheduled_window_end || ""}
                        </p>
                        {(agentResult.job as any).id && (
                          <Link
                            href={`/jobs/${(agentResult.job as any).id}`}
                            className="text-foreground underline"
                          >
                            View job
                          </Link>
                        )}
                      </>
                    ) : (
                      <p>Run Execute to create a job.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assignment</CardTitle>
                    <CardDescription>Subcontractor assignment.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    {agentResult.assignment ? (
                      <>
                        <p className="text-foreground">
                          Status: {(agentResult.assignment as any).status || "—"}
                        </p>
                        {(agentResult.assignment as any).id && (
                          <Link
                            href={`/assignments/${(agentResult.assignment as any).id}`}
                            className="text-foreground underline"
                          >
                            View assignment
                          </Link>
                        )}
                      </>
                    ) : (
                      <p>Run Execute to assign a subcontractor.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notification</CardTitle>
                    <CardDescription>Outbound message record.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    {agentResult.notification ? (
                      <>
                        <p className="text-foreground">
                          {(agentResult.notification as any).status || "—"} ·{" "}
                          {(agentResult.notification as any).channel || "email"}
                        </p>
                        {(agentResult.notification as any).id && (
                          <Link
                            href={`/notifications/${(agentResult.notification as any).id}`}
                            className="text-foreground underline"
                          >
                            View notification
                          </Link>
                        )}
                      </>
                    ) : (
                      <p>Run Execute to send a notification.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
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
          <ActivityTimeline events={timeline as any[]} />
        </CardContent>
      </Card>
    </div>
  );
}
