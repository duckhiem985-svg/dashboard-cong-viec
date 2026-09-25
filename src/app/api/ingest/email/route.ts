import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload lấy từ Gmail MCP:
// { emails: [{ subject, sender, receivedAt?, summary?, category? }] }
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const emails: {
    subject: string;
    sender: string;
    receivedAt?: string;
    summary?: string;
    category?: string;
  }[] = body.emails ?? [];

  for (const e of emails) {
    await prisma.emailLog.create({
      data: {
        subject: e.subject,
        sender: e.sender,
        receivedAt: e.receivedAt ? new Date(e.receivedAt) : new Date(),
        summary: e.summary,
        category: e.category ?? "general",
      },
    });
  }

  await markSynced("email", "gmail_mcp");

  return NextResponse.json({ ok: true, created: emails.length });
}
