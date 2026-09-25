import Link from "next/link";
import { PageHeader } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber } from "@/lib/format";
import {
  displayDate,
  foldText,
  getCareDates,
  getCareReport,
  shiftIso,
  vnYesterdayIso,
} from "@/lib/care";

export const dynamic = "force-dynamic";

type Params = { date?: string; q?: string; staff?: string; customer?: string };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const pick = parts.length > 1 ? [parts[parts.length - 2], parts[parts.length - 1]] : parts;
  return pick.map((p) => p.charAt(0)).join("").toLocaleUpperCase("vi-VN").slice(0, 2) || "?";
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const yesterday = vnYesterdayIso();
  const valid = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) && sp.date <= yesterday;
  const iso = valid ? sp.date! : yesterday;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const staffFilter = (sp.staff ?? "").trim();

  const [report, dates] = await Promise.all([getCareReport(iso), getCareDates()]);
  const nearest = dates.find((d) => d !== iso) ?? null;

  const filtered = report.customers.filter(
    (c) =>
      (!q || foldText(c.name).includes(foldText(q))) &&
      (!staffFilter || c.staff.includes(staffFilter))
  );
  const selected = filtered.find((c) => c.id === sp.customer) ?? filtered[0] ?? null;

  const href = (over: Partial<Params>) => {
    const p = new URLSearchParams();
    const merged = { date: iso, q, staff: staffFilter, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/customers?${p.toString()}`;
  };

  const isYesterday = iso === yesterday;
  const maxStaff = Math.max(1, ...report.staff.map((s) => s.customers));

  return (
    <div>
      <PageHeader
        title="Chăm sóc khách hàng"
        description={
          isYesterday
            ? `Báo cáo ngày hôm qua · ${displayDate(iso)}`
            : `Báo cáo ngày ${displayDate(iso)}`
        }
        badge={
          <div className="care-toolbar">
            <Link className="care-btn" href={href({ date: shiftIso(iso, -1), customer: "" })} aria-label="Ngày trước">
              ‹
            </Link>
            <form action="/customers" method="get" className="care-toolbar">
              <label className="sr-only" htmlFor="care-date">Chọn ngày</label>
              <input id="care-date" className="care-input" type="date" name="date" defaultValue={iso} max={yesterday} />
              {q && <input type="hidden" name="q" value={q} />}
              {staffFilter && <input type="hidden" name="staff" value={staffFilter} />}
              <button className="care-btn" type="submit">Xem</button>
            </form>
            <Link
              className="care-btn"
              href={href({ date: shiftIso(iso, 1), customer: "" })}
              aria-label="Ngày sau"
              aria-disabled={iso >= yesterday}
            >
              ›
            </Link>
          </div>
        }
      />

      <p className="care-count" style={{ marginTop: -14 }}>
        Nguồn: CRM Incomsoft · <SyncBadge module="customers" />
      </p>

      {report.customers.length === 0 ? (
        <div className="care-card" style={{ marginTop: 18 }}>
          <div className="care-empty" role="status">
            <strong>Chưa lấy dữ liệu ngày {displayDate(iso)}</strong>
            Chưa có lượt chăm sóc nào được đồng bộ cho ngày này. Đây chưa phải kết quả &quot;0 khách&quot;.
            {nearest && (
              <div style={{ marginTop: 14 }}>
                <Link className="care-btn is-primary" href={`/customers?date=${nearest}`}>
                  Xem ngày gần nhất có dữ liệu: {displayDate(nearest)}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <section className="care-summary" aria-label="Kết quả trong ngày">
            <div>
              <div className="care-metric-label">Khách ghi nhận trên dashboard</div>
              <div className="care-metric-value">
                {formatNumber(report.customers.length)}
                <small>khách hàng</small>
              </div>
              <span className="care-badge">Chưa có số CRM để đối soát</span>
            </div>
            <div>
              <div className="care-metric-label">Lượt chăm sóc</div>
              <div className="care-metric-value">
                {formatNumber(report.activities)}
                <small>lượt</small>
              </div>
            </div>
            <div>
              <div className="care-metric-label">Nhân viên tham gia</div>
              <div className="care-metric-value">
                {formatNumber(report.staff.length)}
                <small>nhân viên</small>
              </div>
            </div>
          </section>
          <p className="care-notice" role="note">
            Số liệu này được tính từ các lượt chăm sóc đã đồng bộ về dashboard, chưa đối chiếu với tổng hợp của CRM và
            chưa có giờ chăm sóc cụ thể.
          </p>

          <div className="care-layout">
            <section className="care-card" id="list" aria-labelledby="care-list-title">
              <div className="care-card-head">
                <h2 id="care-list-title">Khách hàng đã chăm sóc</h2>
                <form action="/customers" method="get" className="care-filters">
                  <input type="hidden" name="date" value={iso} />
                  <label className="sr-only" htmlFor="care-q">Tìm khách hàng</label>
                  <input id="care-q" className="care-input" type="search" name="q" defaultValue={q} placeholder="Tìm theo tên khách hàng" />
                  <label className="sr-only" htmlFor="care-staff">Lọc nhân viên</label>
                  <select id="care-staff" className="care-input" name="staff" defaultValue={staffFilter}>
                    <option value="">Tất cả nhân viên</option>
                    {report.staff.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <button className="care-btn" type="submit">Lọc</button>
                  {(q || staffFilter) && (
                    <Link className="care-btn" href={`/customers?date=${iso}`}>Xóa lọc</Link>
                  )}
                </form>
                <p className="care-count" aria-live="polite">
                  Hiển thị {formatNumber(filtered.length)}/{formatNumber(report.customers.length)} khách
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="care-empty">
                  <strong>Không có khách khớp bộ lọc</strong>
                  Tổng số khách trong ngày không thay đổi.
                </div>
              ) : (
                <ul className="care-list">
                  {filtered.map((c) => {
                    const active = selected?.id === c.id;
                    return (
                      <li key={c.id}>
                        <Link
                          href={`${href({ customer: c.id })}#detail`}
                          className={active ? "care-row is-selected" : "care-row"}
                          aria-current={active ? "true" : undefined}
                        >
                          <span className="care-avatar" aria-hidden="true">{initials(c.name)}</span>
                          <span style={{ minWidth: 0 }}>
                            <span className="care-name" style={{ display: "block" }} title={c.name}>{c.name}</span>
                            <span className="care-sub" style={{ display: "block" }}>
                              {c.staff[0]}
                              {c.staff.length > 1 ? ` +${c.staff.length - 1}` : ""}
                              {c.activities.length > 1 ? ` · ${c.activities.length} lượt` : ""}
                            </span>
                          </span>
                          <span className="care-preview">{c.activities[0]?.note}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="care-card" id="detail" aria-labelledby="care-detail-title">
              <div className="care-card-head">
                <a className="care-btn care-back" href="#list" style={{ marginBottom: 10 }}>‹ Quay lại danh sách</a>
                <h2 id="care-detail-title">Chi tiết khách hàng</h2>
              </div>
              {selected ? (
                <div className="care-detail-body">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span className="care-avatar" aria-hidden="true">{initials(selected.name)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, overflowWrap: "anywhere" }}>{selected.name}</div>
                      <div className="care-sub">{selected.activities.length} lượt chăm sóc trong ngày</div>
                    </div>
                  </div>
                  <ol className="care-timeline">
                    {selected.activities.map((a) => (
                      <li key={a.id}>
                        <span className="who">{a.staff}</span>
                        <span className="when">Chưa có giờ</span>
                        <p>{a.note}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="care-empty">Chọn một khách hàng để xem chi tiết.</div>
              )}
            </section>
          </div>

          <section className="care-card" style={{ marginTop: 20 }} aria-labelledby="care-staff-title">
            <div className="care-card-head">
              <h2 id="care-staff-title">Theo nhân viên</h2>
              <p className="care-count">
                Số khách riêng biệt mỗi nhân viên đã chăm sóc. Một khách có thể được nhiều nhân viên chăm sóc nên tổng
                theo nhân viên có thể lớn hơn tổng khách trong ngày.
              </p>
            </div>
            <ul className="care-staff">
              {report.staff.map((s) => (
                <li key={s.name}>
                  <span>{s.name}</span>
                  <span className="n">{formatNumber(s.customers)} khách · {formatNumber(s.activities)} lượt</span>
                  <span className="care-bar" aria-hidden="true">
                    <i style={{ width: `${(s.customers / maxStaff) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
