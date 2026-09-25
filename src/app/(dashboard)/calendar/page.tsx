import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

async function toggleDone(id: string, done: boolean) {
  "use server";
  await prisma.checklistItem.update({ where: { id }, data: { done: !done } });
  revalidatePath("/calendar");
}

function vnParts(date: Date) {
  const v = new Date(date.getTime() + VN_OFFSET_MS);
  return {
    key: v.toISOString().slice(0, 10),
    weekday: WEEKDAYS[v.getUTCDay()],
    label: `${String(v.getUTCDate()).padStart(2, "0")}/${String(v.getUTCMonth() + 1).padStart(2, "0")}`,
    time: `${String(v.getUTCHours()).padStart(2, "0")}:${String(v.getUTCMinutes()).padStart(2, "0")}`,
  };
}

export default async function CalendarPage() {
  const todayVn = new Date(Date.now() + VN_OFFSET_MS);
  const startOfToday = new Date(
    Date.UTC(todayVn.getUTCFullYear(), todayVn.getUTCMonth(), todayVn.getUTCDate()) - VN_OFFSET_MS
  );

  const items = await prisma.checklistItem.findMany({
    where: { externalId: { not: null }, date: { gte: startOfToday } },
    orderBy: { date: "asc" },
  });

  const groups = new Map<string, { weekday: string; label: string; items: typeof items }>();
  for (const it of items) {
    const p = vnParts(it.date);
    const g = groups.get(p.key) ?? { weekday: p.weekday, label: p.label, items: [] };
    g.items.push(it);
    groups.set(p.key, g);
  }

  const pending = items.filter((i) => !i.done).length;

  return (
    <div>
      <PageHeader
        title="Lịch công việc"
        description="Các cuộc họp và việc cần làm sắp tới, đồng bộ từ Google Calendar"
        badge={<SyncBadge module="calendar" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sắp tới" value={formatNumber(items.length)} />
        <StatCard label="Chưa hoàn thành" value={formatNumber(pending)} />
        <StatCard label="Đã hoàn thành" value={formatNumber(items.length - pending)} />
      </div>

      {groups.size === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Không có sự kiện công việc nào sắp tới.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {[...groups.entries()].map(([key, g]) => (
            <section key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-800">
                  {g.weekday}, {g.label}
                </h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {g.items.map((item) => {
                  const p = vnParts(item.date);
                  return (
                    <li key={item.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                      <form action={toggleDone.bind(null, item.id, item.done)}>
                        <button
                          type="submit"
                          aria-label={item.done ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"}
                          className="grid h-5 w-5 place-items-center rounded border border-slate-400 text-xs"
                          style={item.done ? { background: "var(--good)", borderColor: "var(--good)", color: "#fff" } : undefined}
                        >
                          {item.done ? "✓" : ""}
                        </button>
                      </form>
                      <span className="w-14 shrink-0 tabular-nums text-slate-600">{p.time}</span>
                      <span className={item.done ? "text-slate-500 line-through" : "text-slate-900"}>
                        {item.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
