"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getJob(params.id);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      }
    };
    load();
  }, [params.id]);

  if (!job) {
    return (
      <div className="space-y-4">
        <Link href="/jobs" className="text-sm text-slate-400 underline">
          Back to jobs
        </Link>
        <p className="text-sm text-slate-300">{error || "Loading job..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/jobs" className="text-sm text-slate-400 underline">
          Back to jobs
        </Link>
        <h2 className="text-2xl font-semibold">Job {job.id}</h2>
        <p className="text-sm text-slate-400">Status: {job.status}</p>
      </header>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">Schedule</h3>
        <p className="mt-2 text-sm text-slate-300">
          {job.scheduled_date} {job.scheduled_window_start} -{" "}
          {job.scheduled_window_end}
        </p>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">Assignment</h3>
        {job.assignments?.map((assignment) => (
          <div key={assignment.id} className="mt-3 text-sm text-slate-300">
            <p className="text-slate-100">
              {assignment.subcontractor?.name || "Unassigned"}
            </p>
            <p>Status: {assignment.status}</p>
            <p>Phone: {assignment.subcontractor?.phone || "—"}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">Notification</h3>
        {job.notification ? (
          <p className="mt-2 text-sm text-slate-300">
            {job.notification.status} → {job.notification.to}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No notification yet.</p>
        )}
      </section>
    </div>
  );
}
