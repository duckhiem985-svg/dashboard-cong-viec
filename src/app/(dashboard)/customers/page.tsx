import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  moi: "Mới",
  dang_cham_soc: "Đang chăm sóc",
  da_mua: "Đã mua",
};

export default async function CustomersPage() {
  const [salesUsers, careBySales, customersBySales, recentCares, totalCustomers, totalCares] =
    await Promise.all([
      prisma.user.findMany({
        where: { role: "SALES", active: true, email: { endsWith: "@crm.local" } },
        select: { id: true, name: true },
      }),
      prisma.careLog.groupBy({ by: ["salesId"], _count: { _all: true } }),
      prisma.customer.groupBy({
        by: ["assignedSalesId"],
        where: { source: "crm_incomsoft" },
        _count: { _all: true },
      }),
      prisma.careLog.findMany({
        where: { customer: { source: "crm_incomsoft" } },
        orderBy: { date: "desc" },
        take: 30,
        include: { customer: true, sales: true },
      }),
      prisma.customer.count({ where: { source: "crm_incomsoft" } }),
      prisma.careLog.count({ where: { customer: { source: "crm_incomsoft" } } }),
    ]);

  const careMap = new Map(careBySales.map((c) => [c.salesId, c._count._all]));
  const custMap = new Map(customersBySales.map((c) => [c.assignedSalesId, c._count._all]));
  const perSales = salesUsers
    .map((s) => ({
      id: s.id,
      name: s.name,
      cares: careMap.get(s.id) ?? 0,
      customers: custMap.get(s.id) ?? 0,
    }))
    .sort((a, b) => b.cares - a.cares);

  return (
    <div>
      <PageHeader
        title="Chăm sóc khách hàng"
        description="Khách hàng được nhân viên chăm sóc, lấy từ CRM mỗi ngày"
        badge={<SyncBadge module="customers" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Khách hàng đã chăm sóc" value={formatNumber(totalCustomers)} />
        <StatCard label="Tổng lượt chăm sóc" value={formatNumber(totalCares)} />
        <StatCard label="Nhân viên tham gia" value={formatNumber(perSales.length)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Theo từng nhân viên</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3 text-right">Khách hàng</th>
              <th className="px-4 py-3 text-right">Lượt chăm sóc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {perSales.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  Chưa có dữ liệu. Chờ schedule CSKH đồng bộ.
                </td>
              </tr>
            ) : (
              perSales.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(s.customers)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(s.cares)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Lượt chăm sóc gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Nội dung chăm sóc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCares.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Chưa có lượt chăm sóc nào.
                  </td>
                </tr>
              ) : (
                recentCares.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(c.date)}</td>
                    <td className="px-4 py-3 font-medium">{c.customer.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">{c.sales.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {STATUS_LABEL[c.customer.status] ?? c.customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.note}</td>
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
