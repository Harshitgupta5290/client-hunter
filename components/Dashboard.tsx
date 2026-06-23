"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Lead,
  Profile,
  DEFAULT_PROFILE,
  REGIONS,
  INDUSTRIES,
  PIPELINE_STAGES,
  REGION_CITIES,
  FOLLOW_UP_TEMPLATES,
  INDUSTRY_SPEND_TIER,
  REGION_SPEND_TIER,
  SmtpConfig,
} from "@/lib/constants";
import { generateInitialEmail, generateFollowUpEmail } from "@/lib/emails";
import {
  saveLeads,
  loadLeads,
  saveProfile,
  loadProfile,
  exportLeadsCSV,
  incrementSearchCount,
  loadUsage,
} from "@/lib/storage";

// ─── Icons ───────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const UserIcon = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />;
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const SendIcon = () => <Icon d="m22 2-7 20-4-9-9-4zM22 2 11 13" />;
const XIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
const SparkleIcon = () => <Icon d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />;
const DownloadIcon = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// ─── Subcomponents ───────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold font-display" style={{ color }}>{value}</div>
      <div className="text-[9px] text-text-muted tracking-[1.5px]">{label}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-3 rounded text-[10px] tracking-[1.5px] font-mono flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
        active ? "bg-bg-tertiary text-white font-semibold" : "bg-transparent text-text-muted hover:text-text-secondary"
      }`}
    >
      {icon} {label}
      {badge && badge > 0 ? (
        <span className="bg-accent-red text-white text-[9px] px-1.5 py-0.5 rounded-lg font-bold">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder: string;
  type?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full py-2.5 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple transition-colors";
  return (
    <div className="mb-4">
      <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + " resize-y"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("find");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [leads, setLeads] = useState<Lead[]>([]);
  const leadsLoaded = useRef(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<{
    lead: Lead;
    to: string;
    subject: string;
    body: string;
    type: string;
  } | null>(null);
  const [searchConfig, setSearchConfig] = useState({
    industry: INDUSTRIES[0],
    region: Object.keys(REGIONS)[0],
    city: REGION_CITIES[Object.keys(REGIONS)[0]][1] || REGION_CITIES[Object.keys(REGIONS)[0]][0],
  });
  const [customCity, setCustomCity] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [smtpTested, setSmtpTested] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [smtpSending, setSmtpSending] = useState(false);
  const [followUpType, setFollowUpType] = useState("no_response_3d");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);
  const [findingEmailId, setFindingEmailId] = useState<string | null>(null);
  const [bulkFinding, setBulkFinding] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState<"hot" | "all">("hot");
  const [usage, setUsage] = useState<{ count: number; remaining: number; pct: number }>({ count: 0, remaining: 10000, pct: 0 });

  // Load persisted data on mount (after hydration to avoid server/client mismatch)
  useEffect(() => {
    setLeads(loadLeads());
    setProfile(loadProfile());
    setUsage(loadUsage());
  }, []);

  // Persist leads — skip the very first run (leads is still [] before localStorage loads)
  useEffect(() => {
    if (!leadsLoaded.current) {
      leadsLoaded.current = true; // mark first run done, don't save yet
      return;
    }
    saveLeads(leads);
  }, [leads]);

  // Poll for email opens every 60s for contacted leads
  useEffect(() => {
    const poll = async () => {
      const contactedIds = leads
        .filter((l) => l.stage === "contacted" && l.emailsSent > 0)
        .map((l) => l.id);
      if (!contactedIds.length) return;
      try {
        const res = await fetch("/api/track-open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: contactedIds }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const openedIds = Object.keys(data.opens);
        if (openedIds.length) {
          setLeads((prev) =>
            prev.map((l) =>
              openedIds.includes(l.id) && l.stage === "contacted"
                ? { ...l, stage: "opened" }
                : l
            )
          );
          showNotif(`📬 ${openedIds.length} lead(s) opened your email`);
        }
      } catch { /* silent */ }
    };
    const interval = setInterval(poll, 60000);
    return () => clearInterval(interval);
  }, [leads]);

  const showNotif = (msg: string) => {
    setNotification(msg);
    const isError = msg.startsWith("⚠") || msg.startsWith("✗") || msg.toLowerCase().includes("error") || msg.toLowerCase().includes("failed");
    const duration = isError ? 7000 : msg.length > 60 ? 5500 : 4000;
    setTimeout(() => setNotification(null), duration);
  };

  // ─── Search for leads ─────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    incrementSearchCount();
    setUsage(loadUsage());
    const effectiveCity = searchConfig.city === "Custom..." ? customCity : searchConfig.city;
    const effectiveIndustry = customIndustry.trim() || searchConfig.industry;
    if (!effectiveCity) { showNotif("Enter a city name first"); setIsSearching(false); return; }
    try {
      const res = await fetch("/api/search-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: effectiveIndustry,
          city: effectiveCity,
          region: searchConfig.region,
        }),
      });
      if (!res.ok) { showNotif("Search failed — check API key"); setIsSearching(false); return; }
      const data = await res.json();
      if (data.leads) {
        // Derive newLeads once using current leads snapshot — no stale closure
        const currentIds = new Set(leads.map((l) => l.placeId).filter(Boolean));
        const sortFn = (a: Lead, b: Lead) => {
          const aNoSite = !a.currentWebsite || a.currentWebsite === "None" ? 0 : 1;
          const bNoSite = !b.currentWebsite || b.currentWebsite === "None" ? 0 : 1;
          if (aNoSite !== bNoSite) return aNoSite - bNoSite;
          const aTier = (INDUSTRY_SPEND_TIER[a.industry] ?? 1) + (REGION_SPEND_TIER[a.region] ?? 1);
          const bTier = (INDUSTRY_SPEND_TIER[b.industry] ?? 1) + (REGION_SPEND_TIER[b.region] ?? 1);
          return bTier - aTier;
        };
        const newLeads: Lead[] = (data.leads as Lead[])
          .filter((l: Lead) => !l.placeId || !currentIds.has(l.placeId))
          .sort(sortFn);

        const dupeCount = data.leads.length - newLeads.length;
        setLeads((prev) => [...newLeads, ...prev]);

        const dupeMsg = dupeCount > 0 ? ` (${dupeCount} dupes skipped)` : "";
        showNotif(`Found ${newLeads.length} new leads${dupeMsg} — scoring their sites...`);

        // Auto-score websites in batches of 4, guard against deleted leads mid-flight
        const leadsWithSites = newLeads.filter(
          (l) => l.currentWebsite && l.currentWebsite !== "None"
        );
        const SCORE_BATCH = 4;
        let scoredCount = 0;
        for (let i = 0; i < leadsWithSites.length; i += SCORE_BATCH) {
          const batch = leadsWithSites.slice(i, i + SCORE_BATCH);
          const results = await Promise.all(
            batch.map(async (lead) => {
              try {
                const r = await fetch("/api/score-website", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: lead.currentWebsite }),
                });
                if (!r.ok) return null;
                const s = await r.json();
                if (!s.score && s.score !== 0) return null;
                scoredCount++;
                return { id: lead.id, score: s.score, issues: s.issues ?? [] };
              } catch {
                return null;
              }
            })
          );
          // Use functional update to avoid overwriting concurrent edits
          setLeads((prev) =>
            prev.map((l) => {
              const s = results.find((r) => r?.id === l.id);
              // Only update if lead still exists and hasn't been manually edited since
              return s ? { ...l, websiteScore: s.score, issues: s.issues.length ? s.issues : l.issues } : l;
            })
          );
        }
        showNotif(`${newLeads.length} leads ready — ${scoredCount} sites scored`);
      }
    } catch (err) {
      console.error("Search failed:", err);
      showNotif("Search failed — check console");
    }
    setIsSearching(false);
  }, [searchConfig]);

  // ─── Score a website ──────────────────────────────────────────
  const scoreWebsite = async (lead: Lead) => {
    if (!lead.currentWebsite || lead.currentWebsite === "None") return;
    setScoringLeadId(lead.id);
    try {
      const res = await fetch("/api/score-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: lead.currentWebsite }),
      });
      if (!res.ok) { showNotif("Score failed — try again"); setScoringLeadId(null); return; }
      const data = await res.json();
      if (!data.score && data.score !== 0) { setScoringLeadId(null); return; }
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, websiteScore: data.score, issues: data.issues || l.issues }
            : l
        )
      );
    } catch (err) {
      console.error("Score failed:", err);
    }
    setScoringLeadId(null);
  };

  // ─── Find email ───────────────────────────────────────────────
  const findEmail = async (lead: Lead) => {
    setFindingEmailId(lead.id);
    try {
      const res = await fetch("/api/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: lead.currentWebsite,
          companyName: lead.businessName,
        }),
      });
      if (!res.ok) { showNotif("Email lookup failed"); setFindingEmailId(null); return; }
      const data = await res.json();
      if (data.email) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === lead.id
              ? {
                  ...l,
                  email: data.email,
                  emailConfidence: data.confidence ?? 50,
                  contactName: data.name || l.contactName,
                }
              : l
          )
        );
        const label = data.confidence <= 25 ? "⚠ guessed address" : "found";
        showNotif(`Email ${label}: ${data.email}`);
      } else {
        showNotif(data.note || "No email found");
      }
    } catch (err) {
      console.error("Email find failed:", err);
    }
    setFindingEmailId(null);
  };

  // ─── Bulk find emails (batched, 3 at a time) ─────────────────
  const bulkFindEmails = async () => {
    const targets = leads.filter((l) => !l.email && l.currentWebsite && l.currentWebsite !== "None");
    if (!targets.length) { showNotif("No leads with websites but missing email"); return; }
    setBulkFinding(true);
    let found = 0, guessed = 0, failed = 0;
    const BATCH = 3;
    for (let i = 0; i < targets.length; i += BATCH) {
      showNotif(`Finding emails... ${i}/${targets.length}`);
      const batch = targets.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (lead) => {
          try {
            const r = await fetch("/api/find-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ domain: lead.currentWebsite, companyName: lead.businessName }),
            });
            if (!r.ok) { failed++; return; }
            const d = await r.json();
            if (d.email && d.confidence > 25) {
              found++;
              setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, email: d.email, emailConfidence: d.confidence, contactName: d.name || l.contactName } : l));
            } else if (d.email && d.confidence <= 25) {
              guessed++;
              // Still store it but mark as guessed so user sees the badge
              setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, email: d.email, emailConfidence: d.confidence } : l));
            } else {
              failed++;
            }
          } catch { failed++; }
        })
      );
    }
    setBulkFinding(false);
    const parts = [`${found} real`];
    if (guessed > 0) parts.push(`${guessed} guessed`);
    if (failed > 0) parts.push(`${failed} failed`);
    showNotif(`Bulk find done — ${parts.join(", ")} (of ${targets.length} total)`);
  };

  // ─── Update lead email directly ───────────────────────────────
  const updateLeadEmail = (leadId: string, email: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, email } : l)));
  };

  // ─── SMTP test ────────────────────────────────────────────────
  const testSmtp = async () => {
    if (!profile.smtp?.host || !profile.smtp?.user || !profile.smtp?.pass) {
      showNotif("Fill in SMTP host, user, and password first");
      return;
    }
    setSmtpTested("testing");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profile.email || profile.smtp.user,
          subject: "Contract Hunter — SMTP Test",
          body: "Your SMTP is working perfectly. Emails will send directly from Contract Hunter.",
          smtp: profile.smtp,
        }),
      });
      const data = await res.json();
      if (data.ok) { setSmtpTested("ok"); showNotif("✓ Test email sent — SMTP is working!"); }
      else { setSmtpTested("fail"); showNotif(`SMTP error: ${data.error}`); }
    } catch (err: any) {
      setSmtpTested("fail");
      showNotif(`SMTP test failed: ${err.message}`);
    }
  };

  // ─── AI Rewrite ───────────────────────────────────────────────
  const handleAiRewrite = async () => {
    if (!emailModal) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailBody: emailModal.body,
          lead: emailModal.lead,
          profile,
        }),
      });
      const data = await res.json();
      if (data.body) {
        setEmailModal((prev) => (prev ? { ...prev, body: data.body } : null));
      } else if (data.error) {
        showNotif(data.error);
      }
    } catch (err) {
      console.error("AI rewrite failed:", err);
    }
    setAiGenerating(false);
  };

  // ─── Email actions ────────────────────────────────────────────
  const openEmailComposer = (lead: Lead, type = "initial") => {
    let email;
    if (type === "initial") {
      email = generateInitialEmail(lead, profile);
    } else {
      email = generateFollowUpEmail(lead, profile, type);
    }
    if (email) setEmailModal({ lead, to: lead.email || "", ...email, type });
  };

  const handleSendEmail = async () => {
    if (!emailModal) return;
    const { lead, to, body } = emailModal;
    const effectiveTo = to.trim() || lead.email;

    // Validate email address
    const EMAIL_VALID = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!effectiveTo) { showNotif("No email address — enter one in the TO field"); return; }
    if (!EMAIL_VALID.test(effectiveTo)) { showNotif(`"${effectiveTo}" doesn't look like a valid email`); return; }

    // Warn if profile placeholders are still in the email body
    if (body.includes("[Your Name]") || body.includes("[your@email.com]")) {
      showNotif("⚠ Email still has unfilled placeholders — go to MY PROFILE tab and save your details");
      return;
    }

    // Warn if unfilled template slots remain
    if (/\[Add [^\]]+\]/.test(body)) {
      showNotif("⚠ Email has unfilled slots like [Add timeline] — edit them before sending");
      return;
    }

    // Save the TO email back to the lead if it was manually entered
    if (effectiveTo !== lead.email) {
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, email: effectiveTo } : l));
    }

    const smtpConfigured = profile.smtp?.host && profile.smtp?.user && profile.smtp?.pass;

    if (smtpConfigured) {
      setSmtpSending(true);
      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: effectiveTo,
            subject: emailModal.subject,
            body: emailModal.body,
            smtp: profile.smtp,
            leadId: lead.id,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === lead.id
                ? { ...l, stage: l.stage === "new" ? "contacted" : l.stage, emailsSent: l.emailsSent + 1, lastContacted: new Date().toISOString() }
                : l
            )
          );
          setEmailModal(null);
          showNotif(`✓ Email sent to ${effectiveTo}`);
        } else {
          showNotif(`SMTP error: ${data.error}`);
        }
      } catch (err: any) {
        showNotif(`Send failed: ${err.message}`);
      }
      setSmtpSending(false);
    } else {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, stage: l.stage === "new" ? "contacted" : l.stage, emailsSent: l.emailsSent + 1, lastContacted: new Date().toISOString() }
            : l
        )
      );
      const mailtoUrl = `mailto:${effectiveTo}?subject=${encodeURIComponent(emailModal.subject)}&body=${encodeURIComponent(emailModal.body)}`;
      window.open(mailtoUrl, "_blank");
      setEmailModal(null);
      showNotif(`Email opened for ${lead.businessName}`);
    }
  };

  const copyEmail = () => {
    if (!emailModal) return;
    navigator.clipboard.writeText(`Subject: ${emailModal.subject}\n\n${emailModal.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateLeadStage = (leadId: string, newStage: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes } : l)));
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLeadId === leadId) setSelectedLeadId(null);
  };

  const handleSaveProfile = () => {
    saveProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    showNotif("Profile saved");
  };

  const handleExportCSV = () => {
    const csv = exportLeadsCSV(leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `client-hunter-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotif("CSV exported");
  };

  // ─── Computed ─────────────────────────────────────────────────
  const stats = {
    total: leads.length,
    contacted: leads.filter((l) => l.stage !== "new").length,
    responded: leads.filter((l) => ["responded", "call_booked", "closed"].includes(l.stage)).length,
    closed: leads.filter((l) => l.stage === "closed").length,
  };

  const followUpLeads = leads.filter((l) =>
    ["contacted", "opened", "responded"].includes(l.stage)
  );

  // Update city options when region changes
  const cityOptions = REGION_CITIES[searchConfig.region] || [];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[2000] bg-bg-tertiary border border-accent-purple/30 text-white text-xs font-mono px-4 py-3 rounded-lg shadow-lg animate-slide-in">
          {notification}
        </div>
      )}

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="bg-gradient-to-b from-bg-secondary to-bg-primary border-b border-bg-tertiary px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-3 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-accent-green rounded-full shadow-[0_0_8px_#22c55e]" />
              <h1 className="font-display text-xl font-bold text-white tracking-tight">
                CONTRACT HUNTER
              </h1>
            </div>
            <p className="text-[11px] text-text-dim mt-1 tracking-[1px]">
              FREELANCE LEADS × OUTREACH AUTOMATION
            </p>
          </div>
          <div className="flex gap-5 items-center">
            <StatCard label="LEADS" value={stats.total} color="#6366f1" />
            <StatCard label="CONTACTED" value={stats.contacted} color="#f59e0b" />
            <StatCard label="RESPONDED" value={stats.responded} color="#10b981" />
            <StatCard label="WON" value={stats.closed} color="#22c55e" />
            {leads.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="p-2 bg-bg-tertiary border-none rounded cursor-pointer text-text-muted hover:text-white transition-colors"
                title="Export CSV"
              >
                <DownloadIcon />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mt-5 bg-bg-secondary rounded-md p-1 border border-bg-tertiary max-w-7xl mx-auto">
          <TabButton active={activeTab === "find"} onClick={() => setActiveTab("find")} icon={<SearchIcon />} label="FIND LEADS" />
          <TabButton active={activeTab === "pipeline"} onClick={() => setActiveTab("pipeline")} icon={<TargetIcon />} label="PIPELINE" />
          <TabButton active={activeTab === "followup"} onClick={() => setActiveTab("followup")} icon={<MailIcon />} label="FOLLOW-UPS" badge={followUpLeads.length} />
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<UserIcon />} label="MY PROFILE" />
        </div>
      </header>

      {/* ─── Content ────────────────────────────────────────── */}
      <main className="px-6 py-5 max-w-7xl mx-auto">
        {/* ═══ FIND LEADS TAB ═══ */}
        {activeTab === "find" && (
          <div className="animate-slide-in">
            {/* Search controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2 items-end">
              <div>
                <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1.5">INDUSTRY</label>
                <select
                  value={customIndustry ? "custom" : searchConfig.industry}
                  onChange={(e) => {
                    if (e.target.value === "custom") return;
                    setCustomIndustry("");
                    setSearchConfig((p) => ({ ...p, industry: e.target.value }));
                  }}
                  className="w-full py-2.5 px-3 bg-bg-secondary border border-bg-tertiary rounded text-text-primary text-xs font-mono cursor-pointer focus:outline-none focus:border-accent-purple"
                >
                  <option value="custom" disabled={!customIndustry}>{customIndustry || "Type custom below..."}</option>
                  {INDUSTRIES.map((i) => {
                    const tier = INDUSTRY_SPEND_TIER[i] ?? 1;
                    const marks = tier === 3 ? " 🔥 $$$" : tier === 2 ? " $$" : "";
                    return <option key={i} value={i}>{i}{marks}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1.5">REGION</label>
                <select
                  value={searchConfig.region}
                  onChange={(e) => {
                    const region = e.target.value;
                    setCustomCity("");
                    setSearchConfig((p) => ({
                      ...p,
                      region,
                      city: REGION_CITIES[region][1] || REGION_CITIES[region][0],
                    }));
                  }}
                  className="w-full py-2.5 px-3 bg-bg-secondary border border-bg-tertiary rounded text-text-primary text-xs font-mono cursor-pointer focus:outline-none focus:border-accent-purple"
                >
                  {Object.keys(REGIONS).map((r) => {
                    const tier = REGION_SPEND_TIER[r] ?? 1;
                    const marks = tier === 3 ? " 🔥 $$$" : tier === 2 ? " $$" : "";
                    return <option key={r} value={r}>{r}{marks}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1.5">CITY</label>
                <select
                  value={searchConfig.city}
                  onChange={(e) => { setCustomCity(""); setSearchConfig((p) => ({ ...p, city: e.target.value })); }}
                  className="w-full py-2.5 px-3 bg-bg-secondary border border-bg-tertiary rounded text-text-primary text-xs font-mono cursor-pointer focus:outline-none focus:border-accent-purple"
                >
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className={`py-2.5 px-6 rounded text-white text-[11px] font-mono font-semibold tracking-[1px] flex items-center justify-center gap-2 border-none cursor-pointer transition-all ${
                  isSearching
                    ? "bg-bg-tertiary cursor-default"
                    : "bg-gradient-to-br from-accent-purple to-accent-violet hover:shadow-lg hover:shadow-accent-purple/20"
                }`}
              >
                {isSearching ? (
                  <span className="animate-pulse">SCANNING...</span>
                ) : (
                  <><SearchIcon /> FIND LEADS</>
                )}
              </button>
            </div>

            {/* Custom city / industry overrides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div>
                {searchConfig.city === "Custom..." && (
                  <input
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Type any city, e.g. Manchester, UK"
                    className="w-full py-2 px-3 bg-bg-primary border border-accent-purple/40 rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple"
                  />
                )}
              </div>
              <div>
                <input
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Custom industry (e.g. Veterinary Clinic, Travel Agency...)"
                  className="w-full py-2 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple placeholder:text-text-dim"
                />
              </div>
            </div>

            {/* Google API usage meter */}
            <div className="mb-4 p-3 bg-bg-secondary border border-bg-tertiary rounded-md">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] text-text-muted tracking-[1.5px]">GOOGLE PLACES API — FREE THIS MONTH (resets monthly)</span>
                <span className={`text-[9px] font-mono ${usage.pct >= 80 ? "text-red-400" : usage.pct >= 50 ? "text-amber-400" : "text-emerald-400"}`}>
                  {usage.count} / 10,000 used · {usage.remaining.toLocaleString()} free calls left
                </span>
              </div>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usage.pct >= 80 ? "bg-red-500" : usage.pct >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.max(usage.pct, usage.count > 0 ? 1 : 0)}%` }}
                />
              </div>
            </div>

            {/* Empty state */}
            {leads.filter((l) => l.stage === "new").length === 0 && !isSearching && (
              <div className="text-center py-20 text-text-dim">
                <div className="flex justify-center mb-3"><GlobeIcon /></div>
                <p className="text-xs tracking-[1px]">
                  {leads.length === 0
                    ? "SELECT COMPANY TYPE, REGION & CITY — THEN HIT FIND LEADS"
                    : "ALL NEW LEADS MOVED TO PIPELINE — SEARCH AGAIN OR CHECK PIPELINE TAB"}
                </p>
              </div>
            )}

            {/* Filter toggle + bulk actions */}
            {leads.filter((l) => l.stage === "new").length > 0 && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[9px] text-text-muted tracking-[1.5px]">SHOW:</span>
                <button
                  onClick={() => setLeadFilter("hot")}
                  className={`text-[9px] px-2.5 py-1 rounded tracking-wide transition-colors ${leadFilter === "hot" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-text-muted border border-bg-tertiary"}`}
                >
                  HIGH-HIRE LIKELIHOOD
                </button>
                <button
                  onClick={() => setLeadFilter("all")}
                  className={`text-[9px] px-2.5 py-1 rounded tracking-wide transition-colors ${leadFilter === "all" ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-text-muted border border-bg-tertiary"}`}
                >
                  ALL LEADS
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={bulkFindEmails}
                    disabled={bulkFinding}
                    className="text-[9px] px-3 py-1 rounded tracking-wide border border-bg-tertiary text-text-muted hover:text-accent-purple hover:border-accent-purple/40 transition-colors flex items-center gap-1"
                  >
                    <MailIcon /> {bulkFinding ? "FINDING..." : "FIND ALL EMAILS"}
                  </button>
                </div>
              </div>
            )}

            {/* Lead cards */}
            <div className="flex flex-col gap-2">
              {leads
                .filter((l) => l.stage === "new")
                .filter((l) => {
                  if (leadFilter === "all") return true;
                  const iT = INDUSTRY_SPEND_TIER[l.industry] ?? 1;
                  const rT = REGION_SPEND_TIER[l.region] ?? 1;
                  return Math.round((iT + rT) / 2) >= 2;
                })
                .map((lead, idx) => (
                  <div
                    key={lead.id}
                    className="bg-bg-secondary border border-bg-tertiary rounded-md transition-all hover:border-accent-purple/50"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Card header */}
                    <div
                      className="p-4 cursor-pointer flex justify-between items-start"
                      onClick={() => setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-semibold text-sm text-white">{lead.businessName}</span>
                          <span className="text-[9px] text-accent-purple bg-accent-purple/10 px-1.5 py-0.5 rounded tracking-wide">
                            {lead.estimatedBudget}
                          </span>
                          {INDUSTRY_SPEND_TIER[lead.industry] === 3 && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded tracking-wide">HIRES DEVS</span>
                          )}
                          {(() => {
                            const iT = INDUSTRY_SPEND_TIER[lead.industry] ?? 1;
                            const rT = REGION_SPEND_TIER[lead.region] ?? 1;
                            const combined = Math.round((iT + rT) / 2) as 1 | 2 | 3;
                            if (combined === 3) return <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded tracking-wide">🔥 HOT</span>;
                            if (combined === 2) return <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded tracking-wide">$$</span>;
                            return null;
                          })()}
                          {lead.rating && (
                            <span className="text-[9px] text-accent-amber">★ {lead.rating}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted mt-1">
                          {lead.industry} · {lead.city} · {lead.contactName}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[9px] text-text-muted tracking-[1px]">WEB SCORE</div>
                          <div
                            className="text-lg font-bold font-display"
                            style={{
                              color: lead.websiteScore === 0 ? "#8888a8" : lead.websiteScore < 30 ? "#ef4444" : lead.websiteScore < 60 ? "#f59e0b" : "#22c55e",
                            }}
                          >
                            {lead.websiteScore > 0 ? `${lead.websiteScore}/100` : "—"}
                          </div>
                        </div>
                        {selectedLeadId === lead.id ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selectedLeadId === lead.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-bg-tertiary animate-slide-in">
                        <div className="pt-4">
                          {/* Info grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-[11px]">
                            <div>
                              <span className="text-text-muted text-[9px] block tracking-[1.5px] mb-1">EMAIL</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    value={lead.email}
                                    onChange={(e) => { e.stopPropagation(); updateLeadEmail(lead.id, e.target.value); }}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="paste or type email..."
                                    className="flex-1 py-1.5 px-2 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-[11px] font-mono focus:outline-none focus:border-accent-purple/50 min-w-0"
                                  />
                                  {!lead.email && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); findEmail(lead); }}
                                      disabled={findingEmailId === lead.id}
                                      className="shrink-0 text-[9px] text-accent-purple hover:text-accent-violet cursor-pointer bg-transparent border-none font-mono whitespace-nowrap"
                                    >
                                      {findingEmailId === lead.id ? "finding..." : "[auto]"}
                                    </button>
                                  )}
                                </div>
                                {lead.email && lead.emailConfidence !== undefined && lead.emailConfidence <= 25 && (
                                  <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded w-fit">
                                    ⚠ guessed address — verify before sending
                                  </span>
                                )}
                                {lead.email && lead.emailConfidence !== undefined && lead.emailConfidence >= 55 && (
                                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded w-fit">
                                    ✓ found on website
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-text-muted">Phone: </span>
                              <span className="text-text-primary">{lead.phone || "—"}</span>
                            </div>
                            <div>
                              <span className="text-text-muted">Website: </span>
                              {lead.currentWebsite && lead.currentWebsite !== "None" ? (
                                <a
                                  href={lead.currentWebsite.startsWith("http") ? lead.currentWebsite : `https://${lead.currentWebsite}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-blue hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {lead.currentWebsite}
                                </a>
                              ) : (
                                <span className="text-accent-red">None</span>
                              )}
                              {lead.currentWebsite && lead.currentWebsite !== "None" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); scoreWebsite(lead); }}
                                  disabled={scoringLeadId === lead.id}
                                  className="ml-2 text-[9px] text-accent-purple hover:text-accent-violet cursor-pointer bg-transparent border-none font-mono"
                                >
                                  {scoringLeadId === lead.id ? "scoring..." : "[re-score]"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Issues — your call prep, NOT sent in emails */}
                          {lead.issues.length > 0 && (
                            <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] text-amber-400 tracking-[1.5px] font-semibold">SITE AUDIT — CALL PREP</span>
                                <span className="text-[9px] text-amber-500/60">use as context — not sent in email</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                {lead.issues.map((issue, i) => (
                                  <div key={i} className="text-[11px] text-amber-300/80 flex items-start gap-1.5">
                                    <span className="text-amber-500/50 mt-0.5 shrink-0">→</span> {issue}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          <div className="mb-4">
                            <textarea
                              value={lead.notes}
                              onChange={(e) => updateLeadNotes(lead.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Add notes about this lead..."
                              rows={2}
                              className="w-full py-2 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-[11px] font-mono resize-y focus:outline-none focus:border-accent-purple/50"
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEmailComposer(lead, "initial"); }}
                              className="py-2 px-4 bg-gradient-to-br from-accent-purple to-accent-violet text-white border-none rounded cursor-pointer text-[10px] font-mono font-semibold tracking-[1px] flex items-center gap-1.5 hover:shadow-lg hover:shadow-accent-purple/20 transition-all"
                            >
                              <MailIcon /> COMPOSE EMAIL
                            </button>
                            <a
                              href={lead.placeId ? `https://foursquare.com/v/${lead.placeId}` : `https://foursquare.com/explore?q=${encodeURIComponent(lead.businessName)}&near=${encodeURIComponent(lead.city)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="py-2 px-4 bg-transparent text-accent-blue border border-bg-tertiary rounded cursor-pointer text-[10px] font-mono tracking-[1px] flex items-center gap-1.5 hover:border-accent-blue/50 transition-colors no-underline"
                            >
                              <MapPinIcon /> FOURSQUARE
                            </a>
                            <a
                              href={`https://www.google.com/maps/search/${encodeURIComponent(lead.businessName + " " + lead.city)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="py-2 px-4 bg-transparent text-accent-blue border border-bg-tertiary rounded cursor-pointer text-[10px] font-mono tracking-[1px] flex items-center gap-1.5 hover:border-accent-blue/50 transition-colors no-underline"
                            >
                              <MapPinIcon /> GOOGLE MAPS
                            </a>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(lead.businessName + " " + lead.city + " contact email")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="py-2 px-4 bg-transparent text-accent-blue border border-bg-tertiary rounded cursor-pointer text-[10px] font-mono tracking-[1px] flex items-center gap-1.5 hover:border-accent-blue/50 transition-colors no-underline"
                            >
                              <GlobeIcon /> GOOGLE
                            </a>
                            <a
                              href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(lead.businessName + " " + lead.city)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="py-2 px-4 bg-transparent text-sky-400 border border-bg-tertiary rounded cursor-pointer text-[10px] font-mono tracking-[1px] flex items-center gap-1.5 hover:border-sky-400/50 transition-colors no-underline"
                            >
                              <GlobeIcon /> LINKEDIN
                            </a>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateLeadStage(lead.id, "contacted"); }}
                              className="py-2 px-4 bg-transparent text-text-muted border border-bg-tertiary rounded cursor-pointer text-[10px] font-mono tracking-[1px] hover:border-text-muted transition-colors"
                            >
                              MARK CONTACTED
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                              className="py-2 px-4 bg-transparent text-accent-red/50 border border-bg-tertiary rounded cursor-pointer text-[10px] font-mono tracking-[1px] hover:text-accent-red hover:border-accent-red/30 transition-colors ml-auto"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ═══ PIPELINE TAB ═══ */}
        {activeTab === "pipeline" && (
          <div className="animate-slide-in">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage.id);
              if (stageLeads.length === 0) return null;
              return (
                <div key={stage.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: stage.color }} />
                    <span className="text-[10px] tracking-[1.5px] text-text-secondary font-semibold">
                      {stage.label.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-text-dim">({stageLeads.length})</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-bg-secondary border border-bg-tertiary rounded p-3 flex justify-between items-center"
                        style={{ borderLeftWidth: "3px", borderLeftColor: stage.color }}
                      >
                        <div>
                          <span className="font-display font-medium text-[13px] text-text-primary">
                            {lead.businessName}
                          </span>
                          <span className="text-[11px] text-text-muted ml-2">
                            {lead.city} · {lead.estimatedBudget}
                          </span>
                          {lead.lastContacted && (
                            <span className="text-[10px] text-text-dim ml-2">
                              Last: {new Date(lead.lastContacted).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <select
                            value={lead.stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                            className="py-1 px-2 bg-bg-primary border border-bg-tertiary rounded text-text-secondary text-[10px] font-mono cursor-pointer focus:outline-none"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => openEmailComposer(lead, lead.stage === "new" ? "initial" : "no_response_3d")}
                            className="p-1.5 bg-bg-tertiary border-none rounded cursor-pointer text-text-muted hover:text-white transition-colors"
                          >
                            <MailIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {leads.length === 0 && (
              <div className="text-center py-20 text-text-dim text-xs tracking-[1px]">
                NO LEADS YET — GO TO FIND LEADS TAB
              </div>
            )}
          </div>
        )}

        {/* ═══ FOLLOW-UPS TAB ═══ */}
        {activeTab === "followup" && (
          <div className="animate-slide-in">
            <div className="mb-5">
              <div className="text-[9px] text-text-muted tracking-[1.5px] mb-2">FOLLOW-UP SCENARIO</div>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(FOLLOW_UP_TEMPLATES).map(([key, tmpl]) => (
                  <button
                    key={key}
                    onClick={() => setFollowUpType(key)}
                    className={`py-2 px-3.5 rounded text-[10px] font-mono tracking-wide cursor-pointer border transition-all ${
                      followUpType === key
                        ? "bg-accent-purple/10 border-accent-purple text-accent-purple"
                        : "bg-bg-secondary border-bg-tertiary text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[9px] text-text-muted tracking-[1.5px] mb-3">
              LEADS NEEDING FOLLOW-UP ({followUpLeads.length})
            </div>

            {followUpLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-bg-secondary border border-bg-tertiary rounded-md p-3.5 mb-2 flex justify-between items-center"
              >
                <div>
                  <span className="font-display font-medium text-[13px] text-text-primary">
                    {lead.businessName}
                  </span>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    Stage:{" "}
                    <span style={{ color: PIPELINE_STAGES.find((s) => s.id === lead.stage)?.color }}>
                      {PIPELINE_STAGES.find((s) => s.id === lead.stage)?.label}
                    </span>
                    {lead.lastContacted && (
                      <> · Last: {new Date(lead.lastContacted).toLocaleDateString()}</>
                    )}
                    · Emails: {lead.emailsSent}
                  </div>
                </div>
                <button
                  onClick={() => openEmailComposer(lead, followUpType)}
                  className="py-2 px-3.5 bg-gradient-to-br from-accent-amber to-orange-500 text-black border-none rounded cursor-pointer text-[10px] font-mono font-semibold tracking-[1px] flex items-center gap-1.5"
                >
                  <SendIcon /> FOLLOW UP
                </button>
              </div>
            ))}

            {followUpLeads.length === 0 && (
              <div className="text-center py-14 text-text-dim text-xs">
                No leads in follow-up stages yet
              </div>
            )}
          </div>
        )}

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === "profile" && (
          <div className="animate-slide-in max-w-xl">
            <p className="text-[11px] text-text-muted mb-5">
              Your details are injected into every outreach email. Fill in once — used everywhere.
            </p>
            <InputField label="YOUR FULL NAME" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} placeholder="Harshit Gupta" />
            <InputField label="YOUR EMAIL" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} placeholder="you@domain.com" />
            <InputField label="PORTFOLIO URL" value={profile.portfolioUrl} onChange={(v) => setProfile((p) => ({ ...p, portfolioUrl: v }))} placeholder="https://your-portfolio.com" />
            <InputField label="TECH STACK / SKILLS (one line)" value={profile.skills} onChange={(v) => setProfile((p) => ({ ...p, skills: v }))} placeholder="Python, React, Node.js, PostgreSQL, LLMs, Docker..." />
            <InputField label="PITCH / UNIQUE SELLING POINT" value={profile.usp} onChange={(v) => setProfile((p) => ({ ...p, usp: v }))} placeholder="Why hire you over anyone else?" textarea />
            <InputField label="PAST WORK / SOCIAL PROOF" value={profile.pastResults} onChange={(v) => setProfile((p) => ({ ...p, pastResults: v }))} placeholder="Projects shipped, companies worked with..." textarea />
            <InputField label="MINIMUM CONTRACT RATE (USD / mo)" value={profile.minPrice} onChange={(v) => setProfile((p) => ({ ...p, minPrice: parseInt(v) || 0 }))} placeholder="3000" type="number" />

            {/* ─── SMTP Section ─────────────────────────────── */}
            <div className="mt-6 mb-5 pt-5 border-t border-bg-tertiary">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${smtpTested === "ok" ? "bg-accent-green shadow-[0_0_6px_#22c55e]" : smtpTested === "fail" ? "bg-red-500" : "bg-text-dim"}`} />
                <span className="text-[10px] text-white tracking-[1.5px] font-semibold">SMTP — ONE-CLICK EMAIL SENDING</span>
              </div>
              <p className="text-[10px] text-text-dim mb-4">
                Configure once → emails send instantly without opening any mail client. For Gmail use App Password (not your real password).
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1.5">SMTP HOST</label>
                  <input
                    value={profile.smtp?.host || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, smtp: { ...p.smtp, host: e.target.value } }))}
                    placeholder="smtp.gmail.com"
                    className="w-full py-2.5 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1.5">PORT</label>
                  <input
                    value={profile.smtp?.port || 587}
                    onChange={(e) => setProfile((p) => ({ ...p, smtp: { ...p.smtp, port: parseInt(e.target.value) || 587 } }))}
                    placeholder="587"
                    type="number"
                    className="w-full py-2.5 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple"
                  />
                </div>
              </div>
              <InputField
                label="SMTP USERNAME (your email)"
                value={profile.smtp?.user || ""}
                onChange={(v) => setProfile((p) => ({ ...p, smtp: { ...p.smtp, user: v } }))}
                placeholder="you@gmail.com"
              />
              <InputField
                label="SMTP PASSWORD / APP PASSWORD"
                value={profile.smtp?.pass || ""}
                onChange={(v) => setProfile((p) => ({ ...p, smtp: { ...p.smtp, pass: v } }))}
                placeholder="Gmail App Password (16 chars)"
                type="password"
              />
              <InputField
                label="FROM NAME (shown to recipient)"
                value={profile.smtp?.fromName || ""}
                onChange={(v) => setProfile((p) => ({ ...p, smtp: { ...p.smtp, fromName: v } }))}
                placeholder="Harshit Gupta"
              />
              <div className="p-3 bg-bg-primary border border-bg-tertiary rounded text-[10px] text-text-dim mb-4 leading-relaxed">
                <strong className="text-text-secondary">Gmail setup:</strong> Go to Google Account → Security → 2-Step Verification → App passwords → create one for "Mail". Use that 16-char password here. Host: smtp.gmail.com, Port: 587.
              </div>
              <button
                onClick={testSmtp}
                disabled={smtpTested === "testing"}
                className={`py-2 px-4 rounded text-[10px] font-mono font-semibold tracking-[1px] border-none cursor-pointer transition-all ${
                  smtpTested === "ok"
                    ? "bg-accent-green text-white"
                    : smtpTested === "fail"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-bg-tertiary text-text-secondary hover:text-white"
                }`}
              >
                {smtpTested === "testing" ? "SENDING TEST..." : smtpTested === "ok" ? "✓ SMTP WORKING" : smtpTested === "fail" ? "✗ FAILED — CHECK SETTINGS" : "SEND TEST EMAIL"}
              </button>
            </div>

            <button
              onClick={handleSaveProfile}
              className={`py-2.5 px-6 rounded text-white text-[11px] font-mono font-semibold tracking-[1px] flex items-center gap-1.5 border-none cursor-pointer transition-all ${
                profileSaved
                  ? "bg-accent-green"
                  : "bg-gradient-to-br from-accent-purple to-accent-violet hover:shadow-lg hover:shadow-accent-purple/20"
              }`}
            >
              {profileSaved ? <><CheckIcon /> SAVED</> : "SAVE PROFILE"}
            </button>
          </div>
        )}
      </main>

      {/* ─── Email Modal ────────────────────────────────────── */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-5 z-[1000]">
          <div className="bg-bg-secondary border border-bg-tertiary rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto animate-slide-in">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-bg-tertiary flex justify-between items-center">
              <div>
                <div className="text-[10px] text-text-muted tracking-[1.5px]">COMPOSING EMAIL TO</div>
                <div className="font-display font-semibold text-white mt-0.5">{emailModal.lead.businessName}</div>
              </div>
              <button onClick={() => setEmailModal(null)} className="bg-transparent border-none text-text-muted cursor-pointer hover:text-white">
                <XIcon />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5">
              <div className="mb-3">
                <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1">TO — <span className="text-accent-purple">editable</span></label>
                <input
                  value={emailModal.to}
                  onChange={(e) => setEmailModal((p) => p ? { ...p, to: e.target.value } : null)}
                  placeholder="Type or paste recipient email..."
                  className="w-full py-2 px-3 bg-bg-primary border border-accent-purple/30 rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple"
                />
              </div>
              <div className="mb-3">
                <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1">SUBJECT</label>
                <input
                  value={emailModal.subject}
                  onChange={(e) => setEmailModal((p) => (p ? { ...p, subject: e.target.value } : null))}
                  className="w-full py-2 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-xs font-mono focus:outline-none focus:border-accent-purple"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[9px] text-text-muted tracking-[1.5px] mb-1">BODY</label>
                <textarea
                  value={emailModal.body}
                  onChange={(e) => setEmailModal((p) => (p ? { ...p, body: e.target.value } : null))}
                  rows={14}
                  className="w-full py-3 px-3 bg-bg-primary border border-bg-tertiary rounded text-text-primary text-xs font-mono leading-relaxed resize-y focus:outline-none focus:border-accent-purple"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleSendEmail}
                  disabled={smtpSending || !emailModal.to}
                  className={`py-2.5 px-5 rounded text-white text-[11px] font-mono font-semibold tracking-[1px] flex items-center gap-1.5 border-none cursor-pointer transition-all ${
                    emailModal.to && !smtpSending
                      ? "bg-gradient-to-br from-accent-green to-green-600 hover:shadow-lg"
                      : "bg-bg-tertiary cursor-default text-text-muted"
                  }`}
                >
                  <SendIcon />
                  {smtpSending
                    ? "SENDING..."
                    : profile.smtp?.host && profile.smtp?.user && profile.smtp?.pass
                    ? "SEND EMAIL"
                    : "OPEN IN MAIL CLIENT"}
                </button>
                <button
                  onClick={copyEmail}
                  className="py-2.5 px-4 bg-bg-tertiary border border-bg-tertiary rounded cursor-pointer text-[11px] font-mono tracking-[1px] flex items-center gap-1.5 text-text-secondary hover:text-white transition-colors"
                >
                  {copied ? <><CheckIcon /> COPIED</> : <><CopyIcon /> COPY</>}
                </button>
                <button
                  onClick={handleAiRewrite}
                  disabled={aiGenerating}
                  className={`py-2.5 px-4 rounded text-white text-[11px] font-mono font-semibold tracking-[1px] flex items-center gap-1.5 border-none cursor-pointer transition-all ${
                    aiGenerating
                      ? "bg-bg-tertiary cursor-default"
                      : "bg-gradient-to-br from-accent-violet to-purple-500 hover:shadow-lg hover:shadow-accent-violet/20"
                  }`}
                >
                  <SparkleIcon /> {aiGenerating ? "REWRITING..." : "AI REWRITE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
