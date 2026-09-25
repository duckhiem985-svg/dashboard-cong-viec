import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export async function SyncBadge({ module }: { module: string }) {
  const status = await prisma.syncStatus.findUnique({ where: { module } });

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Chưa đồng bộ tự động
      </span>
    );
  }

  const minutesAgo = Math.round(
    (Date.now() - status.lastSyncedAt.getTime()) / 60000
  );
  const stale = minutesAgo > 60 * 26; // hơn ~1 ngày kể từ lần chạy schedule gần nhất

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        stale ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          stale ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />
      Cập nhật lúc {formatDateTime(status.lastSyncedAt)}
      {status.source ? ` · ${status.source}` : ""}
    </span>
  );
}
