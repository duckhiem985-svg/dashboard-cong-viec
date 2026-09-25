import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber, formatDate, formatVND } from "@/lib/format";
import { displayDate, getCareDates, getCareDay } from "@/lib/care";

export const dynamic = "force-dynamic";

function CardHeader({ title, module, href }: { title: string; module: string; href: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <Link href={href} className="text-sm font-semibold text-slate-900 hover:underline">
        {title}
      </Link>
      <SyncBadge module={module} />
    </div>
  );
}

export default async function OverviewPage() {
  const dates = await getCareDates();
  const [debts, emails, day] = await Promise.all([
    prisma.debtRecord.findMany({ orderBy: { amount: "desc" } }),
    prisma.emailLog.findMany({ orderBy: { receivedAt: "desc" }, take: 5 }),
    dates[0] ? getCareDay(dates[0]) : Promise.resolve(null),
  ]);

  const totalDebt = debts.reduce((s, d) => s + d.amount, 0);
  const top5 = debts.slice(0, 5);
  const maxDebt = top5[0]?.amount ?? 0;

  return (
    <div>
      <PageHeader title="Tổng quan" description="Tình hình công việc mới nhất được đồng bộ tự động" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Công nợ phải thu" value={formatVND(totalDebt)} hint={`${formatNumber(debts.length)} khách còn nợ`} />
        <StatCard
          label="Khách được chăm sóc"
          value={formatNumber(day?.customers ?? 0)}
          hint={day ? `Ngày ${displayDate(day.iso)}` : "Chưa có dữ liệu"}
        />
        <StatCard label="Lượt chăm sóc" value={formatNumber(day?.cares ?? 0)} hint={day ? `Ngày ${displayDate(day.iso)}` : undefined} />
        <StatCard label="Email công việc" value={formatNumber(emails.length)} hint="Mới nhất" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <CardHeader title="Top 5 khách còn nợ nhiều nhất" module="debt" href="/debt" />
          {top5.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có dữ liệu công nợ.</p>
          ) : (
            <ul className="space-y-3">
              {top5.map((d) => (
                <li key={d.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-slate-800">{d.customerName}</span>
                    <span className="shrink-0 font-medium">{formatVND(d.amount)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(d.amount / maxDebt) * 100}%`, background: "var(--accent)" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <CardHeader
            title={day ? `Chăm sóc khách hàng ngày ${displayDate(day.iso)}` : "Chăm sóc khách hàng"}
            module="customers"
            href="/customers"
          />
          {!day || day.perSales.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có dữ liệu chăm sóc.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {day.perSales.map((s) => (
                <li key={s.name} className="flex justify-between gap-3">
                  <span className="text-slate-800">{s.name}</span>
                  <span className="text-slate-600">{formatNumber(s.customers)} khách</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <CardHeader title="Email mới nhất" module="email" href="/email" />
          {emails.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có email.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {emails.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 py-2">
                  <span className="truncate text-slate-800">{e.subject}</span>
                  <span className="shrink-0 text-slate-500">{formatDate(e.receivedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
