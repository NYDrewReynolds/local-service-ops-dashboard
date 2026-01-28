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
import { getNotification } from "@/lib/api";

type Notification = {
  id: string;
  status: string;
  channel: string;
  to: string;
  subject?: string | null;
  body: string;
  lead?: { id: string };
  job?: { id: string };
};

export default function NotificationDetailPage() {
  const params = useParams<{ id?: string }>();
  const notificationId =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!notificationId) return;
      try {
        const data = await getNotification(notificationId);
        setNotification(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notification");
      }
    };
    load();
  }, [notificationId]);

  if (!notification) {
    return (
      <div className="space-y-4">
        <Link href="/notifications" className="text-sm text-muted-foreground underline">
          Back to notifications
        </Link>
        <p className="text-sm text-muted-foreground">
          {error || "Loading notification..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/notifications" className="text-sm text-muted-foreground underline">
          Back to notifications
        </Link>
        <h2 className="text-2xl font-semibold">
          Notification {notification.id.slice(0, 8)}
        </h2>
        <div className="mt-2">
          <Badge variant="secondary">{notification.status}</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
          <CardDescription>Channel + recipient.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="text-foreground">{notification.channel}</p>
          <p>To: {notification.to}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
          <CardDescription>Payload sent to the customer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="text-foreground">Subject: {notification.subject || "—"}</p>
          <p className="whitespace-pre-line">{notification.body}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Records</CardTitle>
          <CardDescription>Lead and job references.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {notification.lead ? (
            <Link href={`/leads/${notification.lead.id}`} className="text-foreground underline">
              Lead {notification.lead.id}
            </Link>
          ) : (
            <p>Lead: —</p>
          )}
          {notification.job ? (
            <Link href={`/jobs/${notification.job.id}`} className="text-foreground underline">
              Job {notification.job.id}
            </Link>
          ) : (
            <p>Job: —</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
