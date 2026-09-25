import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload lấy từ FB Ads / Facebook MCP:
// { metrics: [{ date?, views, reach, engagement }] }
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const metrics: {
    date?: string;
    views: number;
    reach: number;
    engagement: number;
  }[] = body.metrics ?? [];

  for (const m of metrics) {
    await prisma.socialMetric.create({
      data: {
        platform: "facebook",
        date: m.date ? new Date(m.date) : new Date(),
        views: m.views,
        reach: m.reach,
        engagement: m.engagement,
      },
    });
  }

  await markSynced("facebook", "facebook_mcp");

  return NextResponse.json({ ok: true, created: metrics.length });
}
