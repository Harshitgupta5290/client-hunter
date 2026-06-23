import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SPAM_PATTERN = /\.(png|jpg|gif|svg|css|js|woff)|example\.|sentry\.|@\d|noreply|no-reply|donotreply|placeholder/i;
const OWNER_PATTERN = /owner|founder|ceo|director|manager|president|contact|hello|info/i;

function cleanDomain(raw: string): string {
  return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

async function scrapeEmails(url: string): Promise<string[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const html = await res.text();

  const mailtoMatches = Array.from(html.matchAll(/mailto:([^"'?\s>]+)/gi)).map((m) =>
    m[1].split("?")[0].toLowerCase()
  );
  const textMatches = (html.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase());

  return Array.from(new Set([...mailtoMatches, ...textMatches])).filter(
    (e) => !SPAM_PATTERN.test(e)
  );
}

async function findEmailsOnSite(domain: string): Promise<string[]> {
  const base = `https://${domain}`;
  const pages = [base, `${base}/contact`, `${base}/contact-us`, `${base}/about`, `${base}/about-us`];

  for (const page of pages) {
    try {
      const emails = await scrapeEmails(page);
      if (emails.length > 0) return emails;
    } catch {
      // try next page
    }
  }
  return [];
}

function pickBest(emails: string[]): { email: string; confidence: number } {
  const owner = emails.find((e) => OWNER_PATTERN.test(e));
  return { email: owner || emails[0], confidence: owner ? 75 : 55 };
}

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain || domain === "None") {
      return NextResponse.json({ email: "", note: "No website available to scan" });
    }

    const cd = cleanDomain(domain);
    const emails = await findEmailsOnSite(cd);

    if (emails.length > 0) {
      const { email, confidence } = pickBest(emails);
      return NextResponse.json({ email, confidence, note: "Found via website scan" });
    }

    return NextResponse.json({
      email: `info@${cd}`,
      confidence: 25,
      note: "Guessed — no email found on site",
    });
  } catch (error: any) {
    console.error("Email finder error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
