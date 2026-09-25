import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatDate, formatVND } from "@/lib/format";

export default async function FinancePage() {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [txns, monthAgg, debts] = await Promise.all([
    prisma.financeTransaction.findMany({
      orderBy: { date: "desc" },
      take: 40,
      include: { createdBy: true },
    }),
    prisma.financeTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { date: { gte: startOfMonth } },
    }),
    prisma.debtRecord.findMany({ orderBy: { amount: "desc" } }),
  ]);

  const income = monthAgg.find((m) => m.type === "INCOME")?._sum.amount ?? 0;
  const expense = monthAgg.find((m) => m.type === "EXPENSE")?._sum.amount ?? 0;
  const totalDebt = debts.reduce((s, d) => s + d.amount, 0);
  const overdueDebt = debts
    .filter((d) => d.daysOverdue > 0)
    .reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      <PageHeader title="Tài chính" description="Thu chi và dòng tiền của công ty" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Thu tháng này" value={formatVND(income)} />
        <StatCard label="Chi tháng này" value={formatVND(expense)} />
        <StatCard label="Chênh lệch" value={formatVND(income - expense)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Giao dịch gần đây</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Người tạo</th>
              <th className="px-4 py-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {txns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Chưa có giao dịch nào.
                </td>
              </tr>
            ) : (
              txns.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "INCOME"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {t.type === "INCOME" ? "Thu" : "Chi"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className="px-4 py-3 font-medium">{formatVND(t.amount)}</td>
                  <td className="px-4 py-3 text-slate-500">{t.createdBy.name}</td>
                  <td className="px-4 py-3 text-slate-500">{t.note ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Công nợ phải thu</h2>
        <SyncBadge module="debt" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Tổng công nợ" value={formatVND(totalDebt)} />
        <StatCard label="Nợ quá hạn" value={formatVND(overdueDebt)} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Số tiền nợ</th>
              <th className="px-4 py-3">Hạn thanh toán</th>
              <th className="px-4 py-3">Quá hạn (ngày)</th>
              <th className="px-4 py-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {debts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Chưa có dữ liệu công nợ. Chờ schedule &quot;Bao cao cong no
                  hang ngay&quot; đồng bộ.
                </td>
              </tr>
            ) : (
              debts.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{d.customerName}</td>
                  <td className="px-4 py-3">{formatVND(d.amount)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {d.dueDate ? formatDate(d.dueDate) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {d.daysOverdue > 0 ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        {d.daysOverdue} ngày
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{d.note ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
