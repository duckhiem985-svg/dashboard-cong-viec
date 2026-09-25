import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload lấy từ Google Calendar MCP:
// { items: [{ externalId, title, date, allDay?, assignedToName? }] }
// Trùng externalId thì cập nhật tiêu đề/ngày, giữ nguyên trạng thái "đã xong".
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const items: {
    externalId: string;
    title: string;
    date: string;
    assignedToName?: string;
  }[] = body.items ?? [];

  let synced = 0;
  for (const it of items) {
    if (!it.externalId || !it.title || !it.date) continue;
    const assignedTo = it.assignedToName
      ? await prisma.user.findFirst({ where: { name: it.assignedToName } })
      : null;

    await prisma.checklistItem.upsert({
      where: { externalId: it.externalId },
      update: { title: it.title, date: new Date(it.date) },
      create: {
        externalId: it.externalId,
        title: it.title,
        date: new Date(it.date),
        assignedToId: assignedTo?.id,
      },
    });
    synced++;
  }

  await markSynced("calendar", "google_calendar_mcp");

  return NextResponse.json({ ok: true, synced });
}
