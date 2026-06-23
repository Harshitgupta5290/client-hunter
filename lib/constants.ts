export interface Lead {
  id: string;
  businessName: string;
  industry: string;
  city: string;
  region: string;
  country: string;
  contactName: string;
  email: string;
  phone: string;
  currentWebsite: string;
  websiteScore: number;
  issues: string[];
  estimatedBudget: string;
  stage: string;
  notes: string;
  lastContacted: string | null;
  emailsSent: number;
  createdAt: string;
  placeId?: string;
  address?: string;
  rating?: number;
  emailConfidence?: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
}

export interface Profile {
  name: string;
  email: string;
  portfolioUrl: string;
  skills: string;
  usp: string;
  minPrice: number;
  pastResults: string;
  smtp: SmtpConfig;
}

export const DEFAULT_PROFILE: Profile = {
  name: "Harshit Gupta",
  email: "",
  portfolioUrl: "https://harshitgupta5290.github.io/portfolio",
  skills:
    "Python, JavaScript, TypeScript, SQL · Flask, Node.js, RESTful APIs, Microservices, Celery, Redis · React.js, Next.js, Tailwind CSS · PostgreSQL, MySQL, SQLite · Generative AI, LLMs, RAG, LangChain, NLP, Computer Vision, PyTorch, TensorFlow · OAuth2, JWT, AES-256 · Docker, CI/CD, AWS, Linux",
  usp: "Full-stack contractor (Python/JS/AI) — I embed into teams and ship production-grade features fast, without the overhead of a full-time hire. I've built microservices, REST APIs, AI pipelines (RAG, LLMs, NLP), and full-stack web apps used in production across 40+ countries. Available for contract or freelance engagements: backend, frontend, or full-stack.",
  minPrice: 1500,
  pastResults:
    "Previously a developer at CertifyMe (global SaaS, 40+ countries) — built microservices and APIs handling thousands of daily credential issuances. Independently shipped Rechr (AI-powered cold email SaaS) and ViBlog (multi-category publishing platform), both live in production. Strong across backend (Flask/Node), frontend (React/Next.js), databases (Postgres/MySQL), and AI/ML (LLMs, RAG, Computer Vision).",
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    user: "",
    pass: "",
    fromName: "Harshit Gupta",
  },
};

export const REGIONS: Record<string, string[]> = {
  "USA / Canada": ["US", "CA"],
  "UK / Europe": ["GB", "DE", "FR", "NL", "SE", "IE"],
  "Australia / NZ": ["AU", "NZ"],
  "Middle East": ["AE", "SA", "QA", "BH"],
  "India": ["IN"],
};

export const INDUSTRIES = [
  "SaaS Company",
  "Software Development Agency",
  "Digital Marketing Agency",
  "AI / ML Company",
  "Fintech Company",
  "EdTech Company",
  "E-commerce Tech Company",
  "IT Consulting Firm",
  "Startup (Tech)",
  "Data Analytics Company",
  "Cybersecurity Company",
  "HealthTech Company",
  "PropTech Company",
  "LegalTech Company",
  "Product Studio",
];

// How likely each company type is to hire contract developers (3=high, 2=medium, 1=lower)
export const INDUSTRY_SPEND_TIER: Record<string, 3 | 2 | 1> = {
  "SaaS Company":                 3,
  "Software Development Agency":  3,
  "AI / ML Company":              3,
  "Fintech Company":              3,
  "Startup (Tech)":               3,
  "Digital Marketing Agency":     2,
  "EdTech Company":               2,
  "E-commerce Tech Company":      2,
  "IT Consulting Firm":           2,
  "Data Analytics Company":       2,
  "Cybersecurity Company":        2,
  "HealthTech Company":           2,
  "PropTech Company":             1,
  "LegalTech Company":            1,
  "Product Studio":               1,
};

// How well each region pays for web services (3=high-value, 2=medium, 1=lower)
export const REGION_SPEND_TIER: Record<string, 3 | 2 | 1> = {
  "USA / Canada":    3,
  "Australia / NZ":  3,
  "Middle East":     3,
  "UK / Europe":     2,
  "India":           2,
};

export const PIPELINE_STAGES = [
  { id: "new", label: "New Lead", color: "#6366f1" },
  { id: "contacted", label: "Contacted", color: "#f59e0b" },
  { id: "opened", label: "Opened Email", color: "#3b82f6" },
  { id: "responded", label: "Responded", color: "#10b981" },
  { id: "call_booked", label: "Call Booked", color: "#8b5cf6" },
  { id: "closed", label: "Closed/Won", color: "#22c55e" },
  { id: "lost", label: "Lost", color: "#ef4444" },
];

export const REGION_CITIES: Record<string, string[]> = {
  "USA / Canada": [
    "Custom...",
    "New York, NY",
    "Los Angeles, CA",
    "Toronto, ON",
    "Chicago, IL",
    "Miami, FL",
    "Austin, TX",
    "Denver, CO",
    "Vancouver, BC",
    "Seattle, WA",
    "Boston, MA",
    "San Francisco, CA",
    "Phoenix, AZ",
    "Dallas, TX",
    "Houston, TX",
    "Atlanta, GA",
    "San Diego, CA",
    "Las Vegas, NV",
    "Minneapolis, MN",
    "Portland, OR",
    "Nashville, TN",
    "Charlotte, NC",
    "Calgary, AB",
    "Ottawa, ON",
    "Montreal, QC",
  ],
  "UK / Europe": [
    "Custom...",
    "London, UK",
    "Manchester, UK",
    "Berlin, Germany",
    "Amsterdam, Netherlands",
    "Dublin, Ireland",
    "Stockholm, Sweden",
    "Paris, France",
    "Edinburgh, UK",
    "Munich, Germany",
    "Barcelona, Spain",
    "Birmingham, UK",
    "Leeds, UK",
    "Glasgow, UK",
    "Brussels, Belgium",
    "Vienna, Austria",
    "Zurich, Switzerland",
    "Copenhagen, Denmark",
    "Oslo, Norway",
    "Helsinki, Finland",
    "Warsaw, Poland",
    "Lisbon, Portugal",
    "Rome, Italy",
    "Milan, Italy",
    "Madrid, Spain",
  ],
  "Australia / NZ": [
    "Custom...",
    "Sydney, NSW",
    "Melbourne, VIC",
    "Auckland, NZ",
    "Brisbane, QLD",
    "Perth, WA",
    "Wellington, NZ",
    "Adelaide, SA",
    "Canberra, ACT",
    "Gold Coast, QLD",
    "Christchurch, NZ",
  ],
  "Middle East": [
    "Custom...",
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Riyadh, Saudi Arabia",
    "Doha, Qatar",
    "Jeddah, Saudi Arabia",
    "Manama, Bahrain",
    "Kuwait City, Kuwait",
    "Muscat, Oman",
  ],
  "India": [
    "Custom...",
    "Mumbai, Maharashtra",
    "Delhi, NCR",
    "Bangalore, Karnataka",
    "Hyderabad, Telangana",
    "Pune, Maharashtra",
    "Chennai, Tamil Nadu",
    "Ahmedabad, Gujarat",
    "Surat, Gujarat",
    "Kolkata, West Bengal",
    "Jaipur, Rajasthan",
    "Chandigarh",
    "Noida, UP",
    "Gurgaon, Haryana",
    "Indore, MP",
    "Kochi, Kerala",
    "Bhopal, MP",
    "Lucknow, UP",
    "Nagpur, Maharashtra",
  ],
};

export const FOLLOW_UP_TEMPLATES: Record<
  string,
  { label: string; subject: string; body: string }
> = {
  no_response_3d: {
    label: "No response (3 days)",
    subject: "Following up — {businessName}",
    body: `Hi {contactName},

I hope you're having a good week.

I reached out a few days ago with some thoughts on how automation and AI could create real leverage for {businessName} — just wanted to follow up in case my email got buried.

The 20-minute Systems Audit I mentioned is still on the table. In that time, I can walk through your current workflows, identify where time and budget are being lost, and give you a clear picture of what's worth fixing first.

No pressure at all — even if you're just curious, it's worth a conversation.

Feel free to check out puetto.com to see more of our work, and simply reply here to book a time that suits you.

Warm regards,
{yourName}`,
  },
  opened_no_reply: {
    label: "Opened but no reply",
    subject: "One thing I thought you'd find valuable — {businessName}",
    body: `Hi {contactName},

I noticed you had a chance to look at my previous email — thank you for that.

I wanted to share one specific thing that might be relevant to {businessName}:

{specificSuggestion}.

I've seen this approach deliver {result} for teams in similar spaces — and I believe there's a real version of this that could work well for where {businessName} is right now.

The 20-minute audit would give us the clarity to know exactly what's worth prioritising. No commitment required — just a focused, honest conversation.

You can learn more at puetto.com. Looking forward to hearing from you.

Warm regards,
{yourName}`,
  },
  responded_went_cold: {
    label: "Responded then went cold",
    subject: "Still here when the time is right — {businessName}",
    body: `Hi {contactName},

I hope things are going well at {businessName}.

We had a promising conversation about what automation and smarter systems could do for your team — I just wanted to check in and see if this is still something you're thinking about.

Completely understandable if priorities have shifted. Whenever the timing is right, I'm here — and everything we discussed still applies.

In the meantime, feel free to explore puetto.com to see what we've been building. Looking forward to reconnecting when the moment is right.

Warm regards,
{yourName}`,
  },
  after_call: {
    label: "After discovery call",
    subject: "Proposal for {businessName} — as discussed",
    body: `Hi {contactName},

It was a genuine pleasure speaking with you today. As promised, here is a summary of what we discussed and my proposal for {businessName}:

Scope of work:
{proposalSummary}

Engagement type: {timeline}
Investment: {price}
What's included: {keyFeatures}

I'm truly excited about the potential here — I believe the impact for {businessName} will be both measurable and lasting. This proposal will remain open for 7 days.

If you have any questions or would like to adjust the scope, please don't hesitate to reach out. You can also find more context on our work at puetto.com.

Looking forward to working together.

Warm regards,
{yourName}`,
  },
};
