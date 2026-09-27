import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

export type CareDay = {
  iso: string;
  customers: number;
  cares: number;
  perSales: { name: string; customers: number; cares: number }[];
  logs: {
    id: string;
    customer: string;
    sales: string;
    status: string;
    note: string;
  }[];
};

export async function getCareDates(): Promise<string[]> {
  const rows = await prisma.careLog.findMany({
    where: { customer: { source: "crm_incomsoft" } },
    distinct: ["date"],
    select: { date: true },
    orderBy: { date: "desc" },
    take: 14,
  });
  return rows.map((r) => r.date.toISOString().slice(0, 10));
}

export async function getCareDay(iso: string): Promise<CareDay> {
  const start = new Date(`${iso}T00:00:00.000Z`);
  const logs = await prisma.careLog.findMany({
    where: {
      customer: { source: "crm_incomsoft" },
      date: { gte: start, lt: new Date(start.getTime() + DAY_MS) },
    },
    include: { customer: true, sales: true },
    orderBy: { sales: { name: "asc" } },
  });

  const bySales = new Map<string, { customers: Set<string>; cares: number }>();
  for (const l of logs) {
    const s = bySales.get(l.sales.name) ?? { customers: new Set<string>(), cares: 0 };
    s.customers.add(l.customerId);
    s.cares += 1;
    bySales.set(l.sales.name, s);
  }

  return {
    iso,
    customers: new Set(logs.map((l) => l.customerId)).size,
    cares: logs.length,
    perSales: [...bySales.entries()]
      .map(([name, v]) => ({ name, customers: v.customers.size, cares: v.cares }))
      .sort((a, b) => b.customers - a.customers),
    logs: logs.map((l) => ({
      id: l.id,
      customer: l.customer.name,
      sales: l.sales.name,
      status: l.customer.status,
      note: l.note,
    })),
  };
}

export function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export type CareCustomer = {
  id: string;
  name: string;
  staff: string[];
  activities: { id: string; staff: string; note: string }[];
};

export type CareReport = {
  iso: string;
  customers: CareCustomer[];
  activities: number;
  staff: { name: string; customers: number; activities: number }[];
};

export function vnYesterdayIso(): string {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000 - DAY_MS);
  return d.toISOString().slice(0, 10);
}

export function shiftIso(iso: string, days: number): string {
  return new Date(new Date(`${iso}T00:00:00.000Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function foldText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

export async function getCareReport(iso: string): Promise<CareReport> {
  const start = new Date(`${iso}T00:00:00.000Z`);
  const logs = await prisma.careLog.findMany({
    where: {
      customer: { source: "crm_incomsoft" },
      date: { gte: start, lt: new Date(start.getTime() + DAY_MS) },
    },
    include: { customer: true, sales: true },
    orderBy: { id: "asc" },
  });

  const byCustomer = new Map<string, CareCustomer>();
  const byStaff = new Map<string, { customers: Set<string>; activities: number }>();
  for (const l of logs) {
    const c = byCustomer.get(l.customerId) ?? {
      id: l.customerId,
      name: l.customer.name,
      staff: [],
      activities: [],
    };
    if (!c.staff.includes(l.sales.name)) c.staff.push(l.sales.name);
    c.activities.push({ id: l.id, staff: l.sales.name, note: l.note });
    byCustomer.set(l.customerId, c);

    const s = byStaff.get(l.sales.name) ?? { customers: new Set<string>(), activities: 0 };
    s.customers.add(l.customerId);
    s.activities += 1;
    byStaff.set(l.sales.name, s);
  }

  return {
    iso,
    customers: [...byCustomer.values()].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    activities: logs.length,
    staff: [...byStaff.entries()]
      .map(([name, v]) => ({ name, customers: v.customers.size, activities: v.activities }))
      .sort((a, b) => b.customers - a.customers),
  };
}
