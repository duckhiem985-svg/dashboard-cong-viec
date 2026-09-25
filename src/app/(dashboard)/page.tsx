import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { formatVND, formatNumber } from "@/lib/format";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function OverviewPage() {
  const today = startOfToday();

  const [
    revenueToday,
    ordersToday,
    customersTotal,
    pendingChecklist,
    lowStockItems,
    financeThisMonth,
  ] = await Promise.all([
    prisma.revenueEntry.aggregate({
      _sum: { amount: true },
      where: { date: { gte: today } },
    }),
    prisma.order.count({ where: { orderDate: { gte: today } } }),
    prisma.customer.count(),
    prisma.checklistItem.count({ where: { done: false } }),
    prisma.inventoryItem.findMany({
      where: { quantityOnHand: { lt: 10 } },
      take: 5,
    }),
    prisma.financeTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: {
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  const income =
    financeThisMonth.find((f) => f.type === "INCOME")?._sum.amount ?? 0;
  const expense =
    financeThisMonth.find((f) => f.type === "EXPENSE")?._sum.amount ?? 0;

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Snapshot nhanh các chỉ số quan trọng trong ngày"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Doanh thu hôm nay"
          value={formatVND(revenueToday._sum.amount ?? 0)}
        />
        <StatCard label="Đơn hàng hôm nay" value={formatNumber(ordersToday)} />
        <StatCard label="Tổng khách hàng" value={formatNumber(customersTotal)} />
        <StatCard
          label="Việc chưa hoàn thành (lịch)"
          value={formatNumber(pendingChecklist)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Thu chi tháng này
          </h2>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Thu</span>
            <span className="font-medium text-emerald-600">
              {formatVND(income)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">Chi</span>
            <span className="font-medium text-red-500">
              {formatVND(expense)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold">
            <span>Chênh lệch</span>
            <span>{formatVND(income - expense)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Kho sắp hết hàng
          </h2>
          {lowStockItems.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              Không có mặt hàng nào dưới ngưỡng tồn kho.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {lowStockItems.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-medium text-amber-600">
                    {formatNumber(item.quantityOnHand)} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
