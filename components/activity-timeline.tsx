"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Bot, CheckCircle2, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type TimelineEvent = {
  type: string;
  id: string;
  action_type?: string;
  status?: string;
  created_at?: string;
  error_message?: string | null;
  model?: string | null;
  payload?: Record<string, unknown> | null;
};

const actionLabels: Record<string, string> = {
  validate_plan: "Validated plan",
  create_quote: "Created quote",
  create_job: "Created job",
  assign_subcontractor: "Assigned subcontractor",
  send_notification: "Sent notification",
  execute_plan: "Executed plan",
  plan_only: "Generated plan only",
  assignment_declined: "Subcontractor declined",
};

const actionLinks: Record<
  string,
  { label: string; buildHref: (payload?: Record<string, unknown> | null) => string | null }
> = {
  create_quote: {
    label: "Created quote",
    buildHref: (payload) =>
      payload?.quote_id ? `/quotes/${payload.quote_id}` : null,
  },
  create_job: {
    label: "Created job",
    buildHref: (payload) =>
      payload?.job_id ? `/jobs/${payload.job_id}` : null,
  },
  assign_subcontractor: {
    label: "View assignment",
    buildHref: (payload) =>
      payload?.assignment_id ? `/assignments/${payload.assignment_id}` : null,
  },
  send_notification: {
    label: "View notification",
    buildHref: (payload) =>
      payload?.notification_id ? `/notifications/${payload.notification_id}` : null,
  },
};

function formatTimestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function ActivityTimeline({
  events,
}: {
  events: TimelineEvent[];
}) {
  const normalized = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        created_at: event.created_at,
      })),
    [events]
  );

  if (normalized.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activity yet for this lead.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {normalized.map((event, index) => {
        const isError =
          event.status === "error" || Boolean(event.error_message);
        const isAgent = event.type === "agent_run";
        const Icon = isError
          ? AlertTriangle
          : isAgent
          ? Bot
          : event.action_type === "validate_plan"
          ? Settings
          : CheckCircle2;

        const title = isAgent
          ? `Agent run ${event.status || "update"}`
          : actionLabels[event.action_type || ""] ||
            event.action_type?.replace(/_/g, " ") ||
            "Activity";
        const linkConfig = event.action_type
          ? actionLinks[event.action_type]
          : undefined;
        const linkHref = linkConfig?.buildHref(event.payload ?? undefined);
        const isInlineLink =
          event.action_type === "create_quote" ||
          event.action_type === "create_job";

        return (
          <div
            key={`${event.type}-${event.id}`}
            className="relative grid grid-cols-[20px_1fr] gap-3"
          >
            <div className="relative flex justify-center">
              <div className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-border" />
              <div className="rounded-full border border-border bg-muted p-1">
                <Icon
                  className={
                    isError
                      ? "size-3 text-destructive"
                      : "size-3 text-foreground"
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {isInlineLink && linkHref ? (
                  <Link href={linkHref} className="font-medium underline">
                    {title}
                  </Link>
                ) : (
                  <span className="font-medium">{title}</span>
                )}
                {event.status && (
                  <Badge variant={isError ? "destructive" : "secondary"}>
                    {event.status}
                  </Badge>
                )}
                {isAgent && event.model && (
                  <Badge variant="outline">Model: {event.model}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(event.created_at)}
                </span>
              </div>
              {event.error_message && (
                <p className="text-xs text-destructive">
                  {event.error_message}
                </p>
              )}
              {linkHref && !isInlineLink && (
                <a
                  href={linkHref}
                  className="text-xs font-medium text-foreground underline"
                >
                  {linkConfig?.label}
                </a>
              )}
              {index === normalized.length - 1 && <div className="h-2" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
