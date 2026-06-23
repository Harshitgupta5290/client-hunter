import { Lead, Profile, FOLLOW_UP_TEMPLATES } from "./constants";

export function generateInitialEmail(lead: Lead, profile: Profile) {
  const greeting =
    lead.contactName && lead.contactName !== "[Find on website]"
      ? lead.contactName
      : "there";

  const { hook, value } = getIndustryLines(lead.industry);

  return {
    subject: `A quick thought on ${lead.businessName}'s growth`,
    body: `Hi ${greeting},

I hope this finds you well.

I came across ${lead.businessName} and was genuinely impressed by what you're building. That said, one question stayed with me:

${hook}

My name is ${profile.name || "[Your Name]"} — I'm a full-stack developer and AI/automation specialist with experience shipping production systems across SaaS, fintech, and AI-native products. I've worked with engineering teams to ${value}.

I'd love to offer ${lead.businessName} a complimentary 20-minute Systems & Automation Audit:

  — Review your current tech stack and workflows
  — Identify where time and budget are being lost to manual processes
  — Show you exactly where AI or smart automation could make the biggest impact

This isn't a sales call. It's a straight, honest conversation — you'll walk away with clarity and actionable insights regardless of what you decide next.

Beyond the audit, I'm also open to contract and freelance engagements — whether that's a focused sprint, an ongoing technical partnership, or building a specific feature your team needs. Happy to discuss whatever makes sense for ${lead.businessName}.

You can learn more about our work at puetto.com. If any of this resonates, simply reply to this email and we'll find a time.

Looking forward to connecting.

Warm regards,
${profile.name || "[Your Name]"}
${profile.email || "[your@email.com]"}
puetto.com`.trim(),
  };
}

function getIndustryLines(industry: string): { hook: string; value: string } {
  const map: Record<string, { hook: string; value: string }> = {
    "SaaS Company": {
      hook: "How much of your engineering capacity is going into manual processes and internal overhead rather than the product itself?",
      value: "accelerate feature delivery, automate internal operations, and embed AI capabilities directly into the product",
    },
    "Software Development Agency": {
      hook: "How much of your team's billable time is quietly being absorbed by repetitive dev tasks, manual deployments, and internal coordination?",
      value: "automate delivery workflows, build better internal tooling, and help agencies do more with the same team",
    },
    "AI / ML Company": {
      hook: "Are your AI and data pipelines running as efficiently as they could be — or is engineering time being lost to infrastructure and manual iteration?",
      value: "optimise AI pipelines, integrate LLMs into production, and build scalable ML infrastructure that actually holds up",
    },
    "Fintech Company": {
      hook: "How many of your compliance, reporting, and data workflows still rely on manual effort when they absolutely don't have to?",
      value: "automate financial data pipelines, build secure API integrations, and eliminate the manual bottlenecks that slow fintech teams down",
    },
    "EdTech Company": {
      hook: "How much of your team's time goes into content delivery, user management, and reporting — things that could run entirely on automation?",
      value: "automate learning operations, build AI-assisted features, and systematise the backend work that quietly drains EdTech teams",
    },
    "E-commerce Tech Company": {
      hook: "How many of your backend processes — orders, inventory, integrations — are still handled manually when they could run on autopilot?",
      value: "automate order and data workflows, build smarter platform integrations, and scale operations without scaling the team",
    },
    "IT Consulting Firm": {
      hook: "How much of your consultants' time is spent on delivery coordination and reporting when it could be spent purely on high-value client work?",
      value: "systematise delivery, automate internal reporting, and build the kind of internal tooling that multiplies a consulting team's output",
    },
    "Startup (Tech)": {
      hook: "Is your team moving as fast as you need to — or is technical debt and manual overhead already starting to slow things down?",
      value: "build clean, fast product foundations, automate key workflows early, and ship AI features that give you a real competitive edge",
    },
    "Data Analytics Company": {
      hook: "How much of your pipeline is still manual ETL, data wrangling, and human-in-the-loop work that modern automation could fully replace?",
      value: "automate data pipelines end-to-end, build self-serve dashboards, and turn raw data into reliable outputs without manual intervention",
    },
    "Cybersecurity Company": {
      hook: "Are your internal tooling, alerting, and response workflows as automated and robust as the security products you deliver to clients?",
      value: "automate threat response workflows, build internal security tooling, and integrate APIs across the stack with proper engineering rigour",
    },
    "HealthTech Company": {
      hook: "How much clinical or administrative workflow is still running on manual effort when it could be automated safely, compliantly, and at scale?",
      value: "automate clinical and admin workflows, build compliant data pipelines, and integrate AI features that save real hours every single day",
    },
    "PropTech Company": {
      hook: "How many of your listing management, data, and client workflows are still handled manually when smart automation could unlock your team's full capacity?",
      value: "automate property data workflows, build smart search and matching features, and integrate data sources across your platform",
    },
    "LegalTech Company": {
      hook: "How much document processing, extraction, and workflow routing is still a manual job inside your team when AI can handle it reliably?",
      value: "automate document processing, build AI-powered extraction and routing, and systematise legal workflows end to end",
    },
    "Product Studio": {
      hook: "Is your delivery velocity where it needs to be — or is tooling, tech debt, or process gaps quietly holding your team back?",
      value: "ship faster with clean full-stack architecture, automated testing and deployment pipelines, and AI features built right from day one",
    },
    "Digital Marketing Agency": {
      hook: "How much of your team's time goes into reporting, campaign management, and client delivery that could be running on autopilot?",
      value: "automate reporting and campaign workflows, build custom marketing tech integrations, and create internal tools that multiply your team's output",
    },
  };

  return (
    map[industry] ?? {
      hook: "How much of your team's time is going into tasks that smart automation could handle in a fraction of the time?",
      value: "automate repetitive processes, integrate AI into core workflows, and build systems that scale without scaling the team",
    }
  );
}

export function generateFollowUpEmail(
  lead: Lead,
  profile: Profile,
  type: string
) {
  const template = FOLLOW_UP_TEMPLATES[type];
  if (!template) return null;

  const greeting =
    lead.contactName && lead.contactName !== "[Find on website]"
      ? lead.contactName
      : "there";

  let body = template.body
    .replace(/{businessName}/g, lead.businessName)
    .replace(/{contactName}/g, greeting)
    .replace(/{industry}/g, lead.industry)
    .replace(/{yourName}/g, profile.name || "[Your Name]")
    .replace(/{portfolioUrl}/g, "puetto.com")
    .replace(/{specificIssue}/g, "a workflow that could be fully automated")
    .replace(
      /{specificSuggestion}/g,
      `an AI-powered automation that teams like ${lead.businessName} are using to save 10+ hours a week and reduce operational overhead`
    )
    .replace(/{result}/g, "meaningful reductions in cost and a noticeable lift in delivery speed")
    .replace(/{proposalSummary}/g, "[Add scope details here]")
    .replace(/{timeline}/g, "[Contract / project-based / retainer]")
    .replace(/{price}/g, "[Add your rate]")
    .replace(/{keyFeatures}/g, "[Add deliverables]");

  let subject = template.subject
    .replace(/{businessName}/g, lead.businessName)
    .replace(/{contactName}/g, greeting);

  return { subject, body };
}
