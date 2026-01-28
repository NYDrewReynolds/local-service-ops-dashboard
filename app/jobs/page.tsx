"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJobs } from "@/lib/api";

type Job = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_window_start: string;
  scheduled_window_end: string;
  assignments?: Array<{
    id: string;
    subcontractor?: { name: string };
  }>;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Jobs</h2>
        <p className="text-sm text-slate-400">Scheduled and dispatched work.</p>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold">Job Queue</h3>
        </div>
        <div className="px-6 py-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading jobs...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="py-2">Schedule</th>
                  <th className="py-2">Subcontractor</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-800">
                    <td className="py-3 text-slate-300">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.scheduled_date} {job.scheduled_window_start}-
                        {job.scheduled_window_end}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-300">
                      {job.assignments?.[0]?.subcontractor?.name ?? "—"}
                    </td>
                    <td className="py-3 text-slate-300">{job.status}</td>
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
