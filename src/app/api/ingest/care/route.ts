import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const slug = entry.salesName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "");
    const sales = await prisma.user.upsert({
      where: { email: `${slug}@crm.local` },
      update: {},
      create: {
        email: `${slug}@crm.local`,
        name: entry.salesName,
        role: "SALES",
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
      },
    });

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
