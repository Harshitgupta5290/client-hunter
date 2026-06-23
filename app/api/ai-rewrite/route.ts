import { NextRequest, NextResponse } from "next/server";

const PROMPT = (emailBody: string, lead: any, profile: any) =>
  `Rewrite this cold outreach email to be more compelling, personal, and conversion-focused. Keep it concise (under 150 words). Don't use generic filler. Make it feel like a human wrote it, not AI. Keep the core message but make it punchy and specific.

Business: ${lead.businessName} (${lead.industry}) in ${lead.city}
Issues found: ${lead.issues?.join(", ") || "general website improvements needed"}
Sender: ${profile.name} — ${profile.skills}

Current email:
${emailBody}

Return ONLY the rewritten email body, nothing else. No subject line, no explanation, no markdown.`;

export async function POST(req: NextRequest) {
  try {
    const { emailBody, lead, profile } = await req.json();
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Get a free key at aistudio.google.com" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT(emailBody, lead, profile) }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: data.error?.message || "Gemini returned no content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ body: text.trim() });
  } catch (error: any) {
    console.error("AI rewrite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
