const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

type ApiOptions = RequestInit & { body?: unknown };

async function apiFetch(path: string, options: ApiOptions = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export type Lead = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  service_requested: string;
  notes?: string | null;
  urgency_hint?: string | null;
  status: string;
};

export type AgentRunResult = {
  agent_run: Record<string, unknown>;
  plan?: Record<string, unknown>;
  quote?: Record<string, unknown>;
  job?: Record<string, unknown>;
  assignment?: Record<string, unknown>;
  notification?: Record<string, unknown>;
  errors?: unknown;
};

export async function login(payload: { email: string; password: string }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: payload,
  });
  return data.admin_user;
}

export async function getLeads(): Promise<Lead[]> {
  const data = await apiFetch("/leads");
  return data.leads ?? [];
}

export async function getLead(id: string): Promise<Lead> {
  const data = await apiFetch(`/leads/${id}`);
  return data.lead;
}

export async function createLead(payload: Partial<Lead>) {
  const data = await apiFetch("/leads", {
    method: "POST",
    body: { lead: payload },
  });
  return data.lead;
}

export async function updateLead(id: string, payload: Partial<Lead>) {
  const data = await apiFetch(`/leads/${id}`, {
    method: "PATCH",
    body: { lead: payload },
  });
  return data.lead;
}

export async function runAgent(leadId: string, mode: "plan_only" | "execute") {
  return apiFetch(`/leads/${leadId}/agent_runs`, {
    method: "POST",
    body: { mode },
  });
}

export async function getJobs() {
  const data = await apiFetch("/jobs");
  return data.jobs ?? [];
}

export async function getJob(id: string) {
  const data = await apiFetch(`/jobs/${id}`);
  return data.job;
}

export async function getSubcontractors() {
  const data = await apiFetch("/subcontractors");
  return data.subcontractors ?? [];
}

export async function getPricingRules() {
  const data = await apiFetch("/pricing_rules");
  return data.pricing_rules ?? [];
}

export async function getTimeline(leadId: string) {
  const data = await apiFetch(`/leads/${leadId}/timeline`);
  return data.timeline ?? [];
}

export async function populateDemo() {
  return apiFetch("/demo/populate", { method: "POST" });
}

export async function resetDemo() {
  return apiFetch("/demo/reset", { method: "POST" });
}
