import { NextRequest, NextResponse } from "next/server";

// 1×1 transparent GIF — smallest possible tracking pixel
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("id");
  const ts = new Date().toISOString();

  // Log the open server-side (client reads this via /api/track-open/events)
  if (leadId) {
    console.log(`[OPEN] lead=${leadId} at=${ts}`);
    // Store in a simple in-memory map — persisted to localStorage on the client
    openEvents.set(leadId, ts);
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

// Poll endpoint — client calls this to check for new opens
export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  if (!Array.isArray(ids)) return NextResponse.json({ opens: {} });

  const opens: Record<string, string> = {};
  for (const id of ids) {
    if (openEvents.has(id)) opens[id] = openEvents.get(id)!;
  }
  return NextResponse.json({ opens });
}

// In-memory store — resets on server restart; good enough for a local tool
const openEvents = new Map<string, string>();
