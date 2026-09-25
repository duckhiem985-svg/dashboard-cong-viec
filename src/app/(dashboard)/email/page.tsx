import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/StatCard";
export const dynamic = "force-dynamic";
import { SyncBadge } from "@/components/SyncBadge";
import { formatDate } from "@/lib/format";

export default async function EmailPage() {
  const emails = await prisma.emailLog.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Đọc email"
        description="Danh sách email công việc gần đây, lấy qua Gmail MCP"
        badge={<SyncBadge module="email" />}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ngày nhận</th>
              <th className="px-4 py-3">Người gửi</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Phân loại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {emails.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có email nào.
                </td>
              </tr>
            ) : (
              emails.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(e.receivedAt)}
                  </td>
                  <td className="px-4 py-3">{e.sender}</td>
                  <td className="px-4 py-3">{e.subject}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {e.category}
                    </span>
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
