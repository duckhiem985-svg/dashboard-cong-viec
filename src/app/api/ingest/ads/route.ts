import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload từ schedule "Bao cao google ads hang ngay"
// {
//   campaigns: [
//     { name: string, date?: string, spend: number, clicks: number, impressions: number, conversions: number }
//   ]
// }
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const campaigns: {
    name: string;
    date?: string;
    spend: number;
    clicks: number;
    impressions: number;
    conversions: number;
  }[] = body.campaigns ?? [];

  for (const c of campaigns) {
    await prisma.adCampaign.create({
      data: {
        name: c.name,
        platform: "google_ads",
        date: c.date ? new Date(c.date) : new Date(),
        spend: c.spend,
        clicks: c.clicks,
        impressions: c.impressions,
        conversions: c.conversions,
      },
    });
  }

  await markSynced("ads", "google_ads_schedule");

  return NextResponse.json({ ok: true, created: campaigns.length });
}
