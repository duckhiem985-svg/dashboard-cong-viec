import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload lấy từ Google Calendar MCP:
// { items: [{ title, date, done?, assignedToName? }] }
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const items: {
    title: string;
    date: string;
    done?: boolean;
    assignedToName?: string;
  }[] = body.items ?? [];

  let created = 0;
  for (const it of items) {
    const assignedTo = it.assignedToName
      ? await prisma.user.findFirst({ where: { name: it.assignedToName } })
      : null;

    await prisma.checklistItem.create({
      data: {
        title: it.title,
        date: new Date(it.date),
        done: it.done ?? false,
        assignedToId: assignedTo?.id,
      },
    });
    created++;
  }

  await markSynced("calendar", "google_calendar_mcp");

  return NextResponse.json({ ok: true, created });
}
