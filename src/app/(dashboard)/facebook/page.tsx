import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatDate, formatNumber } from "@/lib/format";

export default async function FacebookPage() {
  const since = new Date();
  since.setDate(since.getDate() - 29);

  const metrics = await prisma.socialMetric.findMany({
    where: { date: { gte: since }, platform: "facebook" },
    orderBy: { date: "desc" },
  });

  const totalViews = metrics.reduce((s, m) => s + m.views, 0);
  const totalReach = metrics.reduce((s, m) => s + m.reach, 0);
  const totalEngagement = metrics.reduce((s, m) => s + m.engagement, 0);

  return (
    <div>
      <PageHeader
        title="Facebook view"
        description="Lượt xem, tiếp cận và tương tác fanpage 30 ngày gần nhất"
        badge={<SyncBadge module="facebook" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Lượt xem" value={formatNumber(totalViews)} />
        <StatCard label="Tiếp cận" value={formatNumber(totalReach)} />
        <StatCard label="Tương tác" value={formatNumber(totalEngagement)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Lượt xem</th>
              <th className="px-4 py-3">Tiếp cận</th>
              <th className="px-4 py-3">Tương tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              metrics.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-slate-500">{formatDate(m.date)}</td>
                  <td className="px-4 py-3">{formatNumber(m.views)}</td>
                  <td className="px-4 py-3">{formatNumber(m.reach)}</td>
                  <td className="px-4 py-3">{formatNumber(m.engagement)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
