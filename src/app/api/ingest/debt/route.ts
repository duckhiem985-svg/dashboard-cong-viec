import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload từ schedule "Bao cao cong no hang ngay"
// {
//   records: [
//     { customerName: string, amount: number, dueDate?: string, daysOverdue?: number, note?: string }
//   ]
// }
// Mỗi lần đồng bộ sẽ thay thế toàn bộ bảng công nợ hiện tại bằng snapshot mới nhất.
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const records: {
    customerName: string;
    amount: number;
    dueDate?: string;
    daysOverdue?: number;
    note?: string;
  }[] = body.records ?? [];

  await prisma.$transaction([
    prisma.debtRecord.deleteMany(),
    prisma.debtRecord.createMany({
      data: records.map((r) => ({
        customerName: r.customerName,
        amount: r.amount,
        dueDate: r.dueDate ? new Date(r.dueDate) : null,
        daysOverdue: r.daysOverdue ?? 0,
        note: r.note,
      })),
    }),
  ]);

  await markSynced("debt", "incomsoft_crm_schedule");

  return NextResponse.json({ ok: true, created: records.length });
}
