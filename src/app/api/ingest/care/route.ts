import { NextRequest, NextResponse } from "next/server";
import { checkIngestAuth, markSynced, saveCareEntries, type CareEntry } from "@/lib/ingest";

// Payload: { entries: CareEntry[] } — date là ISO yyyy-mm-dd, mặc định hôm nay.
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const created = await saveCareEntries((body.entries ?? []) as CareEntry[]);
  await markSynced("customers", "incomsoft_crm_schedule");

  return NextResponse.json({ ok: true, created });
}
