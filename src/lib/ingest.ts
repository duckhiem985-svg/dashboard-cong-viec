import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export function checkIngestAuth(req: NextRequest): NextResponse | null {
  const key = req.headers.get("x-api-key");
  if (!key || key !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export type CareEntry = {
  customerName: string;
  customerPhone?: string;
  salesName: string;
  note: string;
  result?: string;
  date?: string;
};

export async function saveCareEntries(entries: CareEntry[]) {
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
  return created;
}

export async function markSynced(module: string, source?: string, note?: string) {
  await prisma.syncStatus.upsert({
    where: { module },
    update: { lastSyncedAt: new Date(), source, note },
    create: { module, source, note },
  });
}
