# Client Hunter — Lead Generation & Outreach Automation

A personal tool to find businesses that need websites, score their online presence, and send personalized cold outreach emails.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your API keys to .env.local (see below)

# 3. Run locally
npm run dev

# Open http://localhost:3000
```

## API Keys Setup

Copy `.env.local` and fill in your keys. All have free tiers:

| Key | Where to get it | Free tier |
|-----|----------------|-----------|
| `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enable Places API | $200/month free credit |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/settings/keys) | Pay-as-you-go |
| `HUNTER_API_KEY` | [Hunter.io](https://hunter.io/api-keys) | 25 searches/month free |
| `PAGESPEED_API_KEY` | Same Google Cloud project — enable PageSpeed Insights API | Free |

**Without API keys:** The app still works with simulated demo data. Add keys one by one to unlock real features.

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Client Hunter v1"
gh repo create client-hunter --private --push

# 2. Deploy
npx vercel

# 3. Add environment variables in Vercel Dashboard:
#    Settings → Environment Variables → Add each key from .env.local
```

Or connect the GitHub repo to Vercel at [vercel.com/new](https://vercel.com/new).

## Features

- **Find Leads** — Search by industry + city + region. Uses Google Places API (or demo data without key)
- **Website Scoring** — PageSpeed Insights scores any lead's website for performance, SEO, accessibility
- **Email Discovery** — Hunter.io finds business owner emails from their domain
- **Personalized Emails** — Auto-generated using your profile + their specific issues
- **AI Rewrite** — Claude rewrites emails to be more compelling (Anthropic API)
- **Pipeline Management** — Track leads through stages: New → Contacted → Responded → Call Booked → Won
- **Follow-up Templates** — 4 scenarios: no response, opened but ignored, went cold, post-call
- **CSV Export** — Download all leads as spreadsheet
- **Persistent Storage** — All data saved in browser localStorage

## Project Structure

```
client-hunter/
├── app/
│   ├── api/
│   │   ├── search-leads/route.ts    # Google Places search
│   │   ├── score-website/route.ts   # PageSpeed scoring
│   │   ├── find-email/route.ts      # Hunter.io email finder
│   │   └── ai-rewrite/route.ts      # Anthropic email rewriter
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Dashboard.tsx                # Main UI
├── lib/
│   ├── constants.ts                 # Types, config, templates
│   ├── emails.ts                    # Email generation
│   └── storage.ts                   # localStorage persistence
├── .env.local                       # API keys (not committed)
├── package.json
├── tailwind.config.js
└── README.md
```

## How to Use

1. Go to **Profile** tab → fill in your email (rest is pre-filled)
2. Go to **Find Leads** → select industry + region + city → click FIND LEADS
3. Click a lead to expand → click **[find email]** to discover their email
4. Click **[re-score]** to check their website quality
5. Click **COMPOSE EMAIL** → review → **AI REWRITE** if needed → **OPEN IN MAIL CLIENT**
6. After sending, mark as **CONTACTED** in pipeline
7. Use **Follow-ups** tab when leads go cold
8. Export to CSV anytime for records
