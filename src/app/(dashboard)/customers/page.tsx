import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Info, Search, UsersRound, X } from "lucide-react";
import { SyncBadge } from "@/components/SyncBadge";
import { formatNumber } from "@/lib/format";
import { displayDate, foldText, getCareDates, getCareReport, shiftIso, vnYesterdayIso } from "@/lib/care";
import "./care-dashboard.css";

export const dynamic = "force-dynamic";
type Params = { date?: string; q?: string; staff?: string; customer?: string };
const COLORS = ["#B82D32", "#E46B65", "#F3AAA0", "#7A1D25", "#DA958C", "#B6A9A9"];
const CIRCUMFERENCE = 2 * Math.PI * 58;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const pick = parts.length > 1 ? parts.slice(-2) : parts;
  return pick.map((p) => p[0]).join("").toLocaleUpperCase("vi-VN").slice(0, 2) || "?";
}

function isValidReportDate(value: string | undefined, latest: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value > latest) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const yesterday = vnYesterdayIso();
  const iso = isValidReportDate(sp.date, yesterday) ? sp.date : yesterday;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const staffFilter = (sp.staff ?? "").trim();
  const [report, dates] = await Promise.all([getCareReport(iso), getCareDates()]);
  const nearest = dates.find((d) => d !== iso) ?? null;
  const filtered = report.customers.filter((c) => (!q || foldText(c.name).includes(foldText(q))) && (!staffFilter || c.staff.includes(staffFilter)));
  const selected = filtered.find((c) => c.id === sp.customer) ?? filtered[0] ?? null;
  const staffByActivity = [...report.staff].sort((a, b) => b.activities - a.activities || a.name.localeCompare(b.name, "vi"));
  const chartStaff = staffByActivity.length > 6
    ? [...staffByActivity.slice(0, 5), { name: `Nhân viên khác (${staffByActivity.length - 5})`, customers: 0, activities: staffByActivity.slice(5).reduce((sum, s) => sum + s.activities, 0) }]
    : staffByActivity;
  const href = (over: Partial<Params>) => {
    const p = new URLSearchParams();
    const merged = { date: iso, q, staff: staffFilter, ...over };
    for (const [key, value] of Object.entries(merged)) if (value) p.set(key, value);
    return `/customers?${p.toString()}`;
  };

  return <div className="care-v2">
    <header className="care-v2-header">
      <div className="care-v2-heading"><h1>Chăm sóc khách hàng</h1><p>{iso === yesterday ? "Báo cáo ngày hôm qua" : "Báo cáo theo ngày"} <span aria-hidden="true">/</span> {displayDate(iso)}</p></div>
      <div className="care-v2-date-controls" aria-label="Chọn ngày báo cáo">
        <Link className="care-v2-icon-button" href={href({ date: shiftIso(iso, -1), customer: "" })} aria-label="Ngày trước"><ChevronLeft size={18} /></Link>
        <form action="/customers" method="get" className="care-v2-date-form">
          <CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" /><label className="sr-only" htmlFor="care-date">Chọn ngày</label><input id="care-date" type="date" name="date" defaultValue={iso} max={yesterday} />
          {q && <input type="hidden" name="q" value={q} />}{staffFilter && <input type="hidden" name="staff" value={staffFilter} />}
          <button type="submit">Xem</button>
        </form>
        {iso < yesterday ? <Link className="care-v2-icon-button" href={href({ date: shiftIso(iso, 1), customer: "" })} aria-label="Ngày sau"><ChevronRight size={18} /></Link> : <span className="care-v2-icon-button is-disabled" aria-label="Đang xem ngày gần nhất"><ChevronRight size={18} /></span>}
      </div>
    </header>

    {report.customers.length ? <>
      <div className="care-v2-overview">
        <section className="care-v2-feature" aria-labelledby="care-summary-title">
          <div className="care-v2-feature-top"><span id="care-summary-title">Kết quả chăm sóc · {displayDate(iso)}</span><UsersRound size={22} strokeWidth={1.6} aria-hidden="true" /></div>
          <div className="care-v2-feature-main"><strong>{formatNumber(report.customers.length)}</strong><span>khách hàng được ghi nhận</span></div>
          <div className="care-v2-feature-status"><Info size={15} aria-hidden="true" /> Chưa có số CRM để đối soát</div>
          <div className="care-v2-feature-bottom"><div><strong>{formatNumber(report.activities)}</strong><span>lượt chăm sóc</span></div><div><strong>{formatNumber(report.staff.length)}</strong><span>nhân viên tham gia</span></div><div className="care-v2-source"><span>Nguồn: CRM Incomsoft</span><SyncBadge module="customers" /></div></div>
        </section>
        <section className="care-v2-chart" aria-labelledby="care-chart-title">
          <div className="care-v2-chart-head"><div><h2 id="care-chart-title">Hoạt động theo nhân viên</h2><p>Cơ cấu lượt chăm sóc trong ngày</p></div><span>{displayDate(iso)}</span></div>
          <div className="care-v2-chart-body"><div className="care-v2-donut" aria-hidden="true"><svg viewBox="0 0 160 160" focusable="false"><circle cx="80" cy="80" r="58" fill="none" stroke="#F4EBE9" strokeWidth="17" />{chartStaff.map((s, i) => { const length = report.activities ? s.activities / report.activities * CIRCUMFERENCE : 0; const offset = report.activities ? chartStaff.slice(0, i).reduce((sum, item) => sum + item.activities, 0) / report.activities * CIRCUMFERENCE : 0; return <circle key={s.name} cx="80" cy="80" r="58" fill="none" stroke={COLORS[i]} strokeWidth="17" strokeDasharray={`${Math.max(0, length - 2)} ${CIRCUMFERENCE}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)" />; })}</svg><div className="care-v2-donut-center"><strong>{formatNumber(report.activities)}</strong><span>lượt chăm sóc</span></div></div>
            <div className="care-v2-legend">{chartStaff.map((s, i) => i === 5 && report.staff.length > 6 ? <div className="care-v2-legend-row" key={s.name}><span className="care-v2-legend-dot" style={{ backgroundColor: COLORS[i] }} /><span className="care-v2-legend-name" title={s.name}>{s.name}</span><strong>{formatNumber(s.activities)} lượt</strong></div> : <Link className="care-v2-legend-row" href={href({ staff: s.name, customer: "" })} key={s.name} aria-label={`Lọc ${s.name}: ${s.customers} khách, ${s.activities} lượt chăm sóc`}><span className="care-v2-legend-dot" style={{ backgroundColor: COLORS[i] }} /><span className="care-v2-legend-name" title={s.name}>{s.name}<small>{formatNumber(s.customers)} khách</small></span><strong>{formatNumber(s.activities)} lượt</strong></Link>)}</div>
          </div><div className="care-v2-chart-foot">Mỗi lượt được tính theo nhân viên thực hiện.</div>
        </section>
      </div>

      <div className="care-v2-workspace">
        <section className="care-v2-list-panel" id="list" aria-labelledby="care-list-title">
          <div className="care-v2-panel-head"><div><h2 id="care-list-title">Khách hàng đã chăm sóc</h2><p>Chọn một khách để xem nội dung từng lượt</p></div><span className="care-v2-total">{formatNumber(report.customers.length)} khách</span></div>
          <form action="/customers" method="get" className="care-v2-filters"><input type="hidden" name="date" value={iso} /><div className="care-v2-search"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="care-q">Tìm khách hàng</label><input id="care-q" type="search" name="q" defaultValue={q} placeholder="Tìm khách hàng..." /></div><label className="sr-only" htmlFor="care-staff">Lọc nhân viên</label><select id="care-staff" name="staff" defaultValue={staffFilter}><option value="">Tất cả nhân viên</option>{report.staff.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}</select><button type="submit" className="care-v2-filter-button">Lọc</button>{(q || staffFilter) && <Link className="care-v2-clear" href={`/customers?date=${iso}`} aria-label="Xóa bộ lọc"><X size={17} /></Link>}</form>
          <div className="care-v2-list-meta" aria-live="polite">Hiển thị {formatNumber(filtered.length)} / {formatNumber(report.customers.length)} khách</div>
          {filtered.length === 0 ? <div className="care-v2-empty-list"><Search size={24} strokeWidth={1.5} aria-hidden="true" /><strong>Không tìm thấy khách phù hợp</strong><span>Thử tên khác hoặc xóa bộ lọc hiện tại.</span><Link href={`/customers?date=${iso}`}>Xóa bộ lọc <ArrowRight size={15} /></Link></div> : <ul className="care-v2-list">{filtered.map((c) => <li key={c.id}><Link href={`${href({ customer: c.id })}#detail`} className={selected?.id === c.id ? "care-v2-row is-selected" : "care-v2-row"} aria-current={selected?.id === c.id ? "true" : undefined}><span className="care-v2-avatar" aria-hidden="true">{initials(c.name)}</span><span className="care-v2-row-main"><strong title={c.name}>{c.name}</strong><span>{c.staff.join(" · ")}{c.activities.length > 1 ? ` · ${c.activities.length} lượt` : ""}</span></span><span className="care-v2-row-note">{c.activities[0]?.note || "Chưa có nội dung"}</span><ChevronRight className="care-v2-row-arrow" size={17} aria-hidden="true" /></Link></li>)}</ul>}
        </section>
        <section className="care-v2-detail-panel" id="detail" aria-labelledby="care-detail-title"><div className="care-v2-detail-head"><div><span>Hồ sơ trong ngày</span><h2 id="care-detail-title">Chi tiết khách hàng</h2></div><a href="#list" className="care-v2-back"><ChevronLeft size={16} /> Danh sách</a></div>{selected ? <div className="care-v2-detail-content"><div className="care-v2-person"><span className="care-v2-avatar is-large" aria-hidden="true">{initials(selected.name)}</span><div><h3>{selected.name}</h3><p>{selected.activities.length} lượt chăm sóc trong ngày</p></div></div><div className="care-v2-detail-divider"><span>Hoạt động · {displayDate(iso)}</span></div><ol className="care-v2-timeline">{selected.activities.map((a, index) => <li key={a.id}><span className="care-v2-timeline-index">{String(index + 1).padStart(2, "0")}</span><div className="care-v2-timeline-content"><div className="care-v2-timeline-top"><strong>{a.staff}</strong><span><Clock3 size={13} aria-hidden="true" /> Chưa có giờ</span></div><p>{a.note}</p></div></li>)}</ol><p className="care-v2-detail-note"><Info size={15} aria-hidden="true" /> CRM chưa gửi giờ chăm sóc cụ thể cho các lượt này.</p></div> : <div className="care-v2-empty-list">Chọn một khách hàng để xem chi tiết.</div>}</section>
      </div>
      <p className="care-v2-data-footnote">Số liệu được tính từ hoạt động đã đồng bộ về dashboard, chưa đối chiếu với bảng tổng hợp CRM.</p>
    </> : <section className="care-v2-no-data" role="status"><div className="care-v2-no-data-symbol"><CalendarDays size={26} strokeWidth={1.5} /></div><h2>Chưa có báo cáo cho ngày {displayDate(iso)}</h2><p>Chưa có lượt chăm sóc nào được đồng bộ cho ngày này. Đây chưa phải kết quả “0 khách”.</p>{nearest && <Link href={`/customers?date=${nearest}`}>Xem ngày gần nhất · {displayDate(nearest)} <ArrowRight size={16} /></Link>}</section>}
  </div>;
}
