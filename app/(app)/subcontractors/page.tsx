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
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return timeFormatter.format(date);
}

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
        <p className="text-sm text-muted-foreground">Availability and coverage.</p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
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
              <p className="text-xs text-muted-foreground">
                Services: {sub.service_codes.join(", ")}
              </p>
              <div className="mt-4">
                <p className="text-xs uppercase text-muted-foreground">Availability</p>
                <p className="text-xs text-muted-foreground">
                  All times shown in New York (ET).
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {sub.subcontractor_availabilities.map((slot) => (
                    <li key={slot.id}>
                      {dayNames[slot.day_of_week]} {formatTime(slot.window_start)} to{" "}
                      {formatTime(slot.window_end)}
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
