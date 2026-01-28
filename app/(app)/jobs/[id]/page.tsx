"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getJob } from "@/lib/api";

type Job = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_window_start: string;
  scheduled_window_end: string;
  assignments?: Array<{
    id: string;
    status: string;
    subcontractor?: { name: string; phone: string };
  }>;
  notification?: { status: string; to: string };
};

export default function JobDetailPage() {
  const params = useParams<{ id?: string }>();
  const jobId =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!jobId) return;
        const data = await getJob(jobId);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      }
    };
    load();
  }, [jobId]);

  if (!job) {
    return (
      <div className="space-y-4">
        <Link href="/jobs" className="text-sm text-muted-foreground underline">
          Back to jobs
        </Link>
        <p className="text-sm text-muted-foreground">{error || "Loading job..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/jobs" className="text-sm text-muted-foreground underline">
          Back to jobs
        </Link>
        <h2 className="text-2xl font-semibold">Job {job.id}</h2>
        <div className="mt-2">
          <Badge variant="secondary">{job.status}</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Service window assigned to the job.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {job.scheduled_date} {job.scheduled_window_start} -{" "}
            {job.scheduled_window_end}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
          <CardDescription>Current subcontractor status.</CardDescription>
        </CardHeader>
        <CardContent>
          {job.assignments?.map((assignment) => (
            <div key={assignment.id} className="text-sm text-muted-foreground">
              <p className="text-foreground">
                {assignment.subcontractor?.name || "Unassigned"}
              </p>
              <p>Status: {assignment.status}</p>
              <p>Phone: {assignment.subcontractor?.phone || "—"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification</CardTitle>
          <CardDescription>Stubbed delivery record.</CardDescription>
        </CardHeader>
        <CardContent>
          {job.notification ? (
            <p className="text-sm text-muted-foreground">
              {job.notification.status} → {job.notification.to}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No notification yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
