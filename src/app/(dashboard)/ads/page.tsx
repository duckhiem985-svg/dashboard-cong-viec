import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatDate, formatNumber, formatVND } from "@/lib/format";

export default async function AdsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 29);

  const campaigns = await prisma.adCampaign.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const spend = campaigns.reduce((s, c) => s + c.spend, 0);
  const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const conversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const cpc = clicks ? spend / clicks : 0;

  return (
    <div>
      <PageHeader
        title="Google Ads"
        description="Hiệu suất quảng cáo 30 ngày gần nhất"
        badge={<SyncBadge module="ads" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Chi phí" value={formatVND(spend)} />
        <StatCard label="Lượt click" value={formatNumber(clicks)} />
        <StatCard label="Chuyển đổi" value={formatNumber(conversions)} />
        <StatCard label="CPC trung bình" value={formatVND(cpc)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Chiến dịch</th>
              <th className="px-4 py-3">Chi phí</th>
              <th className="px-4 py-3">Hiển thị</th>
              <th className="px-4 py-3">Click</th>
              <th className="px-4 py-3">Chuyển đổi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Chưa có dữ liệu chiến dịch.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.date)}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{formatVND(c.spend)}</td>
                  <td className="px-4 py-3">{formatNumber(c.impressions)}</td>
                  <td className="px-4 py-3">{formatNumber(c.clicks)}</td>
                  <td className="px-4 py-3">{formatNumber(c.conversions)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
