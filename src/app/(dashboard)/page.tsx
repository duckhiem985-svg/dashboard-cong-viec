import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const since = new Date();
  since.setDate(since.getDate() - 2);
  since.setHours(0, 0, 0, 0);

  const [customers, cares, recentCares, emails, recentEmails] = await Promise.all([
    prisma.customer.count({ where: { source: "crm_incomsoft" } }),
    prisma.careLog.count({ where: { customer: { source: "crm_incomsoft" } } }),
    prisma.careLog.count({
      where: { customer: { source: "crm_incomsoft" }, date: { gte: since } },
    }),
    prisma.emailLog.count(),
    prisma.emailLog.findMany({ orderBy: { receivedAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <section className="overview-hero" aria-labelledby="overview-title">
        <div>
          <span className="editorial-eyebrow">Báo cáo công việc / Tổng quan</span>
          <h1 id="overview-title">Một ngày,<br />một nhịp rõ ràng.</h1>
          <p>Các chỉ số chăm sóc khách hàng và email được tập hợp tại một nơi, giúp bạn nắm nhanh tình hình công việc.</p>
        </div>
        <div className="overview-pulse">
          <span className="editorial-eyebrow">Trong 2 ngày gần đây</span>
          <strong>{formatNumber(recentCares)}</strong>
          <p>Lượt chăm sóc khách hàng được ghi nhận</p>
        </div>
      </section>

      <div className="overview-section-line">
        <strong>Chỉ số tổng quan</strong>
        <span>Dữ liệu được đồng bộ tự động từ các nguồn công việc</span>
      </div>
      <section className="overview-grid editorial-stats" aria-label="Chỉ số tổng quan">
        <StatCard label="Khách hàng đã chăm sóc" value={formatNumber(customers)} />
        <StatCard label="Tổng lượt chăm sóc" value={formatNumber(cares)} />
        <StatCard label="Lượt chăm sóc 2 ngày gần đây" value={formatNumber(recentCares)} />
        <StatCard label="Email công việc" value={formatNumber(emails)} />
      </section>

      <div className="overview-panels">
        <section className="overview-panel" aria-labelledby="care-heading">
          <div className="overview-panel-head">
            <h2 id="care-heading">Chăm sóc khách hàng</h2>
            <SyncBadge module="customers" />
          </div>
          <p className="overview-panel-copy">Theo dõi tổng số khách hàng, hoạt động chăm sóc và kết quả theo từng nhân viên.</p>
          <Link href="/customers" className="editorial-link">Xem chi tiết ↗</Link>
        </section>

        <section className="overview-panel" aria-labelledby="email-heading">
          <div className="overview-panel-head">
            <h2 id="email-heading">Email mới nhất</h2>
            <SyncBadge module="email" />
          </div>
          {recentEmails.length === 0 ? (
            <p className="overview-panel-copy">Chưa có email.</p>
          ) : (
            <ul className="overview-email-list">
              {recentEmails.map((email) => (
                <li key={email.id}>
                  <span title={email.subject}>{email.subject}</span>
                  <time dateTime={email.receivedAt.toISOString()}>{formatDate(email.receivedAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
