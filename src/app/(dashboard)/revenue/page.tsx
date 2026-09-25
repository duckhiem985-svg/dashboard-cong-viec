import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { formatVND } from "@/lib/format";

export default async function RevenuePage() {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const entries = await prisma.revenueEntry.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const e of entries) {
    const key = e.date.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + e.amount);
  }

  const chartData = Array.from(byDay.entries()).map(([date, amount]) => ({
    date: date.slice(5),
    amount,
  }));

  const total30d = entries.reduce((s, e) => s + e.amount, 0);
  const avgDay = chartData.length ? total30d / chartData.length : 0;

  const bySource = new Map<string, number>();
  for (const e of entries) {
    bySource.set(e.source, (bySource.get(e.source) ?? 0) + e.amount);
  }

  return (
    <div>
      <PageHeader title="Doanh thu" description="Doanh thu tổng hợp 30 ngày gần nhất" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Doanh thu 30 ngày" value={formatVND(total30d)} />
        <StatCard label="Trung bình / ngày" value={formatVND(avgDay)} />
        <StatCard label="Số nguồn doanh thu" value={String(bySource.size)} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Xu hướng doanh thu theo ngày
        </h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có dữ liệu doanh thu.</p>
        ) : (
          <RevenueChart data={chartData} />
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Doanh thu theo nguồn</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nguồn</th>
              <th className="px-4 py-3">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from(bySource.entries()).map(([source, amount]) => (
              <tr key={source}>
                <td className="px-4 py-3">{source}</td>
                <td className="px-4 py-3 font-medium">{formatVND(amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
