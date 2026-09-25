import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const since = new Date();
  since.setDate(since.getDate() - 2);
  since.setHours(0, 0, 0, 0);

  const [customers, cares, recentCares, emails, recentEmails] = await Promise.all([
    prisma.customer.count({ where: { source: "crm_incomsoft" } }),
    prisma.careLog.count({ where: { customer: { source: "crm_incomsoft" } } }),
    prisma.careLog.count({
      where: { customer: { source: "crm_incomsoft" }, date: { gte: since } },
    }),
    prisma.emailLog.count(),
    prisma.emailLog.findMany({ orderBy: { receivedAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Các chỉ số công việc đang được đồng bộ tự động"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Khách hàng đã chăm sóc" value={formatNumber(customers)} />
        <StatCard label="Tổng lượt chăm sóc" value={formatNumber(cares)} />
        <StatCard label="Lượt chăm sóc 2 ngày gần đây" value={formatNumber(recentCares)} />
        <StatCard label="Email công việc" value={formatNumber(emails)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Chăm sóc khách hàng</h2>
            <SyncBadge module="customers" />
          </div>
          <Link href="/customers" className="text-sm font-medium text-blue-700 hover:underline">
            Xem chi tiết
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Email mới nhất</h2>
            <SyncBadge module="email" />
          </div>
          {recentEmails.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có email.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentEmails.map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
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
