import { NextRequest, NextResponse } from "next/server";

function estimateBudget(rating?: number, reviewCount?: number): string {
  if (!rating || !reviewCount) return "$3,000 - $6,000 / mo";
  if (reviewCount > 500 && rating > 4) return "$15,000+ / mo";
  if (reviewCount > 200) return "$8,000 - $15,000 / mo";
  if (reviewCount > 50) return "$4,000 - $8,000 / mo";
  return "$3,000 - $6,000 / mo";
}

// Maps our industry labels → search phrases that surface real hiring companies
const INDUSTRY_QUERY: Record<string, string> = {
  "SaaS Company":                 "SaaS software company",
  "Software Development Agency":  "software development agency",
  "Digital Marketing Agency":     "digital marketing technology agency",
  "AI / ML Company":              "artificial intelligence machine learning company",
  "Fintech Company":              "fintech financial technology company",
  "EdTech Company":               "edtech education technology company",
  "E-commerce Tech Company":      "e-commerce technology company",
  "IT Consulting Firm":           "IT consulting technology firm",
  "Startup (Tech)":               "tech startup",
  "Data Analytics Company":       "data analytics company",
  "Cybersecurity Company":        "cybersecurity technology company",
  "HealthTech Company":           "healthtech digital health company",
  "PropTech Company":             "proptech real estate technology company",
  "LegalTech Company":            "legaltech law technology company",
  "Product Studio":               "product design studio technology",
};

async function searchGooglePlaces(industry: string, city: string, region: string, apiKey: string) {
  const queryPhrase = INDUSTRY_QUERY[industry] || industry;
  // Single API call with field masking — maxResultCount=20 (same billing unit regardless of count)
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber",
    },
    body: JSON.stringify({ textQuery: `${queryPhrase} in ${city}`, maxResultCount: 20 }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    console.error("Google Places error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const results: any[] = data.places ?? [];
  if (!results.length) return null;

  return results.map((b: any, idx: number) => ({
    id: b.id || `gp_${Date.now()}_${idx}`,
    businessName: b.displayName?.text || b.displayName || "",
    industry,
    city,
    region,
    country: "",
    contactName: "[Find on website]",
    email: "",
    phone: b.nationalPhoneNumber || "",
    currentWebsite: b.websiteUri || "None",
    websiteScore: 0,
    issues: [],
    estimatedBudget: estimateBudget(b.rating, b.userRatingCount),
    stage: "new",
    notes: "",
    lastContacted: null,
    emailsSent: 0,
    createdAt: new Date().toISOString(),
    placeId: b.id || "",
    address: b.formattedAddress || city,
    rating: b.rating,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { industry, city, region } = await req.json();
    if (!industry?.trim() || !city?.trim() || !region?.trim()) {
      return NextResponse.json({ error: "industry, city, and region are required" }, { status: 400 });
    }
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleKey) {
      return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not set." }, { status: 500 });
    }

    const leads = await searchGooglePlaces(industry, city, region, googleKey);
    if (leads) return NextResponse.json({ leads, source: "google" });

    return NextResponse.json({ error: "No results found for that industry and city." }, { status: 404 });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
