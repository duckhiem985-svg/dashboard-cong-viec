import Link from "next/link";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber } from "@/lib/format";
import { displayDate, getCareDates, getCareDay } from "@/lib/care";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  moi: "Mới",
  dang_cham_soc: "Đang chăm sóc",
  da_mua: "Đã mua",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const dates = await getCareDates();
  const selected =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : (dates[0] ?? null);
  const day = selected ? await getCareDay(selected) : null;

  return (
    <div>
      <PageHeader
        title="Chăm sóc khách hàng"
        description="Số khách được nhân viên chăm sóc theo từng ngày, lấy từ CRM"
        badge={<SyncBadge module="customers" />}
      />

      {dates.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Ngày:</span>
          {dates.map((d) => (
            <Link
              key={d}
              href={`/customers?date=${d}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                d === selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {displayDate(d)}
            </Link>
          ))}
        </div>
      )}

      {!day || day.cares === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          {selected
            ? `Không có lượt chăm sóc nào trong ngày ${displayDate(selected)}.`
            : "Chưa có dữ liệu. Chờ schedule CSKH đồng bộ."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Khách hàng được chăm sóc"
              value={formatNumber(day.customers)}
              hint={`Ngày ${displayDate(day.iso)}`}
            />
            <StatCard label="Lượt chăm sóc" value={formatNumber(day.cares)} />
            <StatCard label="Nhân viên tham gia" value={formatNumber(day.perSales.length)} />
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Theo nhân viên ngày {displayDate(day.iso)}
              </h2>
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
                {day.perSales.map((s) => (
                  <tr key={s.name}>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(s.customers)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(s.cares)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Chi tiết từng lượt chăm sóc</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Nội dung chăm sóc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {day.logs.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-3 font-medium">{l.customer}</td>
                      <td className="whitespace-nowrap px-4 py-3">{l.sales}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {STATUS_LABEL[l.status] ?? l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{l.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
