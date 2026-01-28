"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPricingRules, getServices, Service } from "@/lib/api";

type PricingRule = {
  id: string;
  service_code: string;
  min_price_cents: number;
  max_price_cents: number;
  base_price_cents: number;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [servicesData, pricingData] = await Promise.all([
          getServices(),
          getPricingRules(),
        ]);
        setServices(servicesData);
        setPricingRules(pricingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services");
      }
    };
    load();
  }, []);

  const pricingByCode = useMemo(() => {
    return pricingRules.reduce<Record<string, PricingRule>>((acc, rule) => {
      acc[rule.service_code] = rule;
      return acc;
    }, {});
  }, [pricingRules]);

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Services & Pricing</h2>
        <p className="text-sm text-muted-foreground">
          Service catalog with pricing guardrails.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>All amounts shown in USD.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const pricing = pricingByCode[service.code];
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.code}
                    </TableCell>
                    <TableCell>
                      {pricing
                        ? currency.format(pricing.base_price_cents / 100)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {pricing
                        ? currency.format(pricing.min_price_cents / 100)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {pricing
                        ? currency.format(pricing.max_price_cents / 100)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {pricing
                        ? `${currency.format(pricing.min_price_cents / 100)}–${currency.format(
                            pricing.max_price_cents / 100
                          )}`
                        : "No pricing rule"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
