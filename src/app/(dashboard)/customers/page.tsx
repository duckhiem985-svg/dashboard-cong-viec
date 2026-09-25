import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatVND, formatNumber, formatDate } from "@/lib/format";

export default async function CustomersPage() {
  const salesUsers = await prisma.user.findMany({
    where: { role: "SALES", active: true },
  });

  const perSales = await Promise.all(
    salesUsers.map(async (sales) => {
      const [orders, careCount, customerCount] = await Promise.all([
        prisma.order.findMany({ where: { salesId: sales.id } }),
        prisma.careLog.count({ where: { salesId: sales.id } }),
        prisma.customer.count({ where: { assignedSalesId: sales.id } }),
      ]);
      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const completed = orders.filter((o) => o.status === "completed").length;
      const closeRate = orders.length
        ? Math.round((completed / orders.length) * 100)
        : 0;

      return {
        id: sales.id,
        name: sales.name,
        revenue,
        orderCount: orders.length,
        closeRate,
        careCount,
        customerCount,
      };
    })
  );

  const recentCustomers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { assignedSales: true, careLogs: { orderBy: { date: "desc" }, take: 1 } },
  });

  const totalRevenue = perSales.reduce((s, x) => s + x.revenue, 0);
  const totalOrders = perSales.reduce((s, x) => s + x.orderCount, 0);
  const totalCustomers = await prisma.customer.count();

  return (
    <div>
      <PageHeader
        title="Chăm sóc khách hàng"
        description="Doanh thu, doanh số, đơn hàng, tỉ lệ chốt đơn và khách hàng đã chăm sóc theo từng sales"
        badge={<SyncBadge module="customers" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng doanh thu (đơn)" value={formatVND(totalRevenue)} />
        <StatCard label="Tổng đơn hàng" value={formatNumber(totalOrders)} />
        <StatCard label="Số sales đang hoạt động" value={formatNumber(salesUsers.length)} />
        <StatCard label="Tổng khách hàng" value={formatNumber(totalCustomers)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Bảng theo từng Sales
          </h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Doanh thu</th>
              <th className="px-4 py-3">Đơn hàng</th>
              <th className="px-4 py-3">Tỉ lệ chốt đơn</th>
              <th className="px-4 py-3">Khách hàng phụ trách</th>
              <th className="px-4 py-3">Lượt chăm sóc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {perSales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Chưa có sales nào.
                </td>
              </tr>
            ) : (
              perSales.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3">{formatVND(s.revenue)}</td>
                  <td className="px-4 py-3">{formatNumber(s.orderCount)}</td>
                  <td className="px-4 py-3">{s.closeRate}%</td>
                  <td className="px-4 py-3">{formatNumber(s.customerCount)}</td>
                  <td className="px-4 py-3">{formatNumber(s.careCount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Khách hàng đã chăm sóc gần đây
          </h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Sales phụ trách</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Chăm sóc gần nhất</th>
              <th className="px-4 py-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Chưa có khách hàng nào.
                </td>
              </tr>
            ) : (
              recentCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3">{c.assignedSales?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {c.careLogs[0]?.note ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
