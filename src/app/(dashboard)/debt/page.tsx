import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber, formatVND } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DebtPage() {
  const debts = await prisma.debtRecord.findMany({ orderBy: { amount: "desc" } });
  const total = debts.reduce((s, d) => s + d.amount, 0);
  const top5 = debts.slice(0, 5).reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      <PageHeader
        title="Công nợ phải thu"
        description="Công nợ còn lại theo từng khách hàng, lấy từ Google Sheet kế hoạch thu tiền"
        badge={<SyncBadge module="debt" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng công nợ" value={formatVND(total)} />
        <StatCard label="Số khách còn nợ" value={formatNumber(debts.length)} />
        <StatCard
          label="Top 5 khách chiếm"
          value={total ? `${Math.round((top5 / total) * 100)}%` : "0%"}
          hint="trên tổng công nợ"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-right">Công nợ</th>
                <th className="px-4 py-3 text-right">Tỉ trọng</th>
                <th className="px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {debts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Chưa có dữ liệu công nợ.
                  </td>
                </tr>
              ) : (
                debts.map((d, i) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{d.customerName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      {formatVND(d.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {total ? ((d.amount / total) * 100).toFixed(1) : "0"}%
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.note || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
