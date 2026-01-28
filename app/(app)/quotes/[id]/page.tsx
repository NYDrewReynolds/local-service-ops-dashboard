"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getQuote } from "@/lib/api";

type QuoteLineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
};

type Quote = {
  id: string;
  total_cents: number;
  subtotal_cents: number;
  confidence: string;
  lead_id: string;
  quote_line_items: QuoteLineItem[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function QuoteDetailPage() {
  const params = useParams<{ id?: string }>();
  const quoteId =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!quoteId) return;
      try {
        const data = await getQuote(quoteId);
        setQuote(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quote");
      }
    };
    load();
  }, [quoteId]);

  const lineItems = useMemo(() => quote?.quote_line_items ?? [], [quote]);

  if (!quote) {
    return (
      <div className="space-y-4">
        <Link href="/quotes" className="text-sm text-muted-foreground underline">
          Back to quotes
        </Link>
        <p className="text-sm text-muted-foreground">{error || "Loading quote..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/quotes" className="text-sm text-muted-foreground underline">
          Back to quotes
        </Link>
        <h2 className="text-2xl font-semibold">Quote {quote.id.slice(0, 8)}</h2>
        <p className="text-sm text-muted-foreground">Lead: {quote.lead_id}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Totals and confidence.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <div>Subtotal: {currency.format(quote.subtotal_cents / 100)}</div>
          <div>Total: {currency.format(quote.total_cents / 100)}</div>
          <div>Confidence: {quote.confidence}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Breakdown of quoted work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {lineItems.map((item) => (
            <div key={item.id} className="rounded-md border border-border bg-muted p-3">
              <div className="font-medium text-foreground">{item.description}</div>
              <div>
                Qty {item.quantity} · {currency.format(item.unit_price_cents / 100)} each
              </div>
              <div>Total: {currency.format(item.total_cents / 100)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
