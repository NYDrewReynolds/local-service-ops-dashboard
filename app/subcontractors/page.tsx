"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubcontractors } from "@/lib/api";

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

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SubcontractorsPage() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubcontractors();
        setSubcontractors(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load subcontractors"
        );
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Subcontractors</h2>
        <p className="text-sm text-slate-400">Availability and coverage.</p>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {subcontractors.map((sub) => (
          <Card key={sub.id}>
            <CardHeader>
              <CardTitle>{sub.name}</CardTitle>
              <CardDescription>{sub.phone}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                Services: {sub.service_codes.join(", ")}
              </p>
              <div className="mt-4">
                <p className="text-xs uppercase text-slate-500">Availability</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {sub.subcontractor_availabilities.map((slot) => (
                    <li key={slot.id}>
                      {dayNames[slot.day_of_week]} {slot.window_start}-
                      {slot.window_end}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
