import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatDate, formatNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

async function toggleDone(id: string, done: boolean) {
  "use server";
  await prisma.checklistItem.update({
    where: { id },
    data: { done: !done },
  });
  revalidatePath("/calendar");
}

export default async function CalendarPage() {
  const items = await prisma.checklistItem.findMany({
    orderBy: { date: "asc" },
    include: { assignedTo: true },
  });

  const pending = items.filter((i) => !i.done).length;
  const done = items.length - pending;

  return (
    <div>
      <PageHeader
        title="Checklist lịch"
        description="Việc cần làm đồng bộ từ Google Calendar"
        badge={<SyncBadge module="calendar" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng việc" value={formatNumber(items.length)} />
        <StatCard label="Chưa hoàn thành" value={formatNumber(pending)} />
        <StatCard label="Đã hoàn thành" value={formatNumber(done)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Xong</th>
              <th className="px-4 py-3">Việc cần làm</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Người phụ trách</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có việc nào.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <form action={toggleDone.bind(null, item.id, item.done)}>
                      <button
                        type="submit"
                        className={`h-5 w-5 rounded border ${
                          item.done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                        aria-label="toggle done"
                      >
                        {item.done ? "✓" : ""}
                      </button>
                    </form>
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      item.done ? "text-slate-400 line-through" : "text-slate-800"
                    }`}
                  >
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(item.date)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.assignedTo?.name ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
