import { Lead, Profile, DEFAULT_PROFILE } from "./constants";

const LEADS_KEY = "client_hunter_leads";
const PROFILE_KEY = "client_hunter_profile";
const USAGE_KEY = "client_hunter_api_usage";

// Google Places API (New): 10,000 free calls/month (as of March 2025), resets every month
const FREE_CALLS_PER_MONTH = 10000;

export function incrementSearchCount(): number {
  if (typeof window === "undefined") return 0;
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const count = (data.month === monthKey ? data.count : 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify({ month: monthKey, count }));
    return count;
  } catch {
    return 0;
  }
}

export function loadUsage(): { count: number; remaining: number; pct: number } {
  if (typeof window === "undefined") return { count: 0, remaining: FREE_CALLS_PER_MONTH, pct: 0 };
  try {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const raw = localStorage.getItem(USAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const count = data.month === monthKey ? data.count : 0;
    const remaining = FREE_CALLS_PER_MONTH - count;
    const pct = Math.min(100, Math.round((count / FREE_CALLS_PER_MONTH) * 100));
    return { count, remaining, pct };
  } catch {
    return { count: 0, remaining: FREE_CALLS_PER_MONTH, pct: 0 };
  }
}

export function saveLeads(leads: Lead[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProfile(profile: Profile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function exportLeadsCSV(leads: Lead[]): string {
  const headers = [
    "Business Name",
    "Industry",
    "City",
    "Region",
    "Contact",
    "Email",
    "Phone",
    "Website",
    "Score",
    "Budget",
    "Stage",
    "Issues",
    "Emails Sent",
    "Last Contacted",
    "Notes",
  ];

  const q = (v: string | number) =>
    `"${String(v).replace(/\n/g, " ").replace(/\r/g, "").replace(/"/g, '""')}"`;

  const rows = leads.map((l) => [
    q(l.businessName),
    q(l.industry),
    q(l.city),
    q(l.region),
    q(l.contactName),
    q(l.email),
    q(l.phone),
    q(l.currentWebsite),
    l.websiteScore,
    q(l.estimatedBudget),
    q(l.stage),
    q(l.issues.join("; ")),
    l.emailsSent,
    q(l.lastContacted || ""),
    q(l.notes),
  ]);

  return [headers.map((h) => `"${h}"`).join(","), ...rows.map((r) => r.join(","))].join("\n");
}
