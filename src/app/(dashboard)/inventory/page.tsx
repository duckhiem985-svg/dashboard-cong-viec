import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { formatDate, formatNumber } from "@/lib/format";

export default async function InventoryPage() {
  const [items, recentTxns] = await Promise.all([
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryTransaction.findMany({
      orderBy: { date: "desc" },
      take: 30,
      include: { item: true, createdBy: true },
    }),
  ]);

  const lowStock = items.filter((i) => i.quantityOnHand < 10).length;

  return (
    <div>
      <PageHeader title="Nhập kho" description="Tồn kho hiện tại và lịch sử nhập/xuất" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng mặt hàng" value={formatNumber(items.length)} />
        <StatCard label="Mặt hàng sắp hết" value={formatNumber(lowStock)} />
        <StatCard
          label="Tổng tồn kho"
          value={formatNumber(items.reduce((s, i) => s + i.quantityOnHand, 0))}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Tồn kho theo mặt hàng</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Tên hàng</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Đơn vị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có mặt hàng nào.
                </td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{i.sku}</td>
                  <td className="px-4 py-3">{i.name}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      i.quantityOnHand < 10 ? "text-amber-600" : "text-slate-800"
                    }`}
                  >
                    {formatNumber(i.quantityOnHand)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{i.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Lịch sử nhập/xuất gần đây</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Mặt hàng</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Số lượng</th>
              <th className="px-4 py-3">Người tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentTxns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Chưa có giao dịch nào.
                </td>
              </tr>
            ) : (
              recentTxns.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-3">{t.item.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "IN"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {t.type === "IN" ? "Nhập" : "Xuất"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatNumber(t.quantity)}</td>
                  <td className="px-4 py-3 text-slate-500">{t.createdBy.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
