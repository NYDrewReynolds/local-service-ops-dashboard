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
import { Button } from "@/components/ui/button";
import { getAssignment, updateAssignment } from "@/lib/api";

type Assignment = {
  id: string;
  status: string;
  subcontractor?: { name: string; phone: string };
  job?: { id: string };
};

export default function AssignmentDetailPage() {
  const params = useParams<{ id?: string }>();
  const assignmentId =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!assignmentId) return;
      try {
        const data = await getAssignment(assignmentId);
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assignment");
      }
    };
    load();
  }, [assignmentId]);

  const handleDecline = async () => {
    if (!assignmentId) return;
    setUpdating(true);
    setError(null);
    try {
      const data = await updateAssignment(assignmentId, { status: "declined" });
      setAssignment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update assignment");
    } finally {
      setUpdating(false);
    }
  };

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Link href="/assignments" className="text-sm text-muted-foreground underline">
          Back to assignments
        </Link>
        <p className="text-sm text-muted-foreground">
          {error || "Loading assignment..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/assignments" className="text-sm text-muted-foreground underline">
          Back to assignments
        </Link>
        <div>
          <h2 className="text-2xl font-semibold">
            Assignment {assignment.id.slice(0, 8)}
          </h2>
          <Badge variant="secondary">{assignment.status}</Badge>
        </div>
        <Button
          variant="outline"
          onClick={handleDecline}
          disabled={updating || assignment.status === "declined"}
        >
          {assignment.status === "declined"
            ? "Subcontractor Declined"
            : "Mark as Refused"}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Subcontractor</CardTitle>
          <CardDescription>Assigned partner details.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="text-foreground">{assignment.subcontractor?.name ?? "—"}</p>
          <p>Phone: {assignment.subcontractor?.phone ?? "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job</CardTitle>
          <CardDescription>Linked job record.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {assignment.job ? (
            <Link href={`/jobs/${assignment.job.id}`} className="text-foreground underline">
              {assignment.job.id}
            </Link>
          ) : (
            "—"
          )}
        </CardContent>
      </Card>
    </div>
  );
}
