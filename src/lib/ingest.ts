import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export function checkIngestAuth(req: NextRequest): NextResponse | null {
  const key = req.headers.get("x-api-key");
  if (!key || key !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function markSynced(module: string, source?: string, note?: string) {
  await prisma.syncStatus.upsert({
    where: { module },
    update: { lastSyncedAt: new Date(), source, note },
    create: { module, source, note },
  });
}
