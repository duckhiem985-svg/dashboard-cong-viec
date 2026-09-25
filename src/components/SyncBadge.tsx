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
      <span className="sync-badge">
        <span className="sync-badge-dot" />
        Chưa đồng bộ tự động
      </span>
    );
  }

  // Server-rendered sync status is intentionally compared with the request time.
  const minutesAgo = Math.round(
    // eslint-disable-next-line react-hooks/purity
    (Date.now() - status.lastSyncedAt.getTime()) / 60000
  );
  const stale = minutesAgo > 60 * 26; // hơn ~1 ngày kể từ lần chạy schedule gần nhất

  return (
    <span className={`sync-badge ${stale ? "is-stale" : "is-fresh"}`}>
      <span className="sync-badge-dot" />
      Cập nhật lúc {formatDateTime(status.lastSyncedAt)}
      {status.source ? ` · ${status.source}` : ""}
    </span>
  );
}
