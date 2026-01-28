"use client";

import { useMemo } from "react";
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
};

const actionLabels: Record<string, string> = {
  validate_plan: "Validated plan",
  create_quote: "Created quote",
  create_job: "Created job",
  assign_subcontractor: "Assigned subcontractor",
  send_notification: "Sent notification",
  execute_plan: "Executed plan",
  plan_only: "Generated plan only",
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

        return (
          <div key={`${event.type}-${event.id}`} className="relative pl-7">
            <div className="absolute left-2 top-3 h-full w-px bg-border" />
            <div className="absolute left-0 top-2 rounded-full border border-border bg-muted p-1">
              <Icon
                className={
                  isError ? "size-3 text-destructive" : "size-3 text-foreground"
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{title}</span>
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
              <p className="mt-1 text-xs text-destructive">
                {event.error_message}
              </p>
            )}
            {index === normalized.length - 1 && (
              <div className="mt-2 h-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
