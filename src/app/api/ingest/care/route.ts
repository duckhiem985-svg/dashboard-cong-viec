import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIngestAuth, markSynced } from "@/lib/ingest";

// Payload từ schedule "Bao cao cham soc kh hang ngay"
// {
//   entries: [
//     {
//       customerName: string,
//       customerPhone?: string,
//       salesName: string,          // tên nhân viên sales trên CRM
//       note: string,                // nội dung chăm sóc
//       result?: string,
//       date?: string                // ISO date, mặc định hôm nay
//     }
//   ]
// }
export async function POST(req: NextRequest) {
  const authError = checkIngestAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const entries: {
    customerName: string;
    customerPhone?: string;
    salesName: string;
    note: string;
    result?: string;
    date?: string;
  }[] = body.entries ?? [];

  let created = 0;
  for (const entry of entries) {
    const sales = await prisma.user.findFirst({
      where: { name: entry.salesName },
    });
    if (!sales) continue;

    let customer = await prisma.customer.findFirst({
      where: { name: entry.customerName },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: entry.customerName,
          phone: entry.customerPhone,
          assignedSalesId: sales.id,
          status: "dang_cham_soc",
          source: "crm_incomsoft",
        },
      });
    }

    await prisma.careLog.create({
      data: {
        customerId: customer.id,
        salesId: sales.id,
        note: entry.note,
        result: entry.result,
        date: entry.date ? new Date(entry.date) : new Date(),
      },
    });
    created++;
  }

  await markSynced("customers", "incomsoft_crm_schedule");

  return NextResponse.json({ ok: true, created });
}
