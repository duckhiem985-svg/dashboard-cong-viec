// Quét "Danh sách công việc" (module Tasks) của CRM — nguồn của dashboard CSKH mới.
// Mỗi công việc = 1 lượt chăm sóc. Lưu theo mã bản ghi CRM nên chạy lại bao nhiêu lần cũng không trùng.
import { prisma } from "@/lib/prisma";
import { crmSession, fold, parseVnDate, tableRows, text, vnDay } from "@/lib/crm";

const PAGE = 100;
const MAX_PAGES = 60; // 6.000 công việc / lần quét — quá số này là bất thường, dừng để khỏi treo

/** Tên cột trên CRM (đã bỏ dấu) → trường của mình. Ô tiêu đề khớp tên nào trước thì lấy. */
const COLUMNS: Record<string, string[]> = {
  title: ["tieu de", "chu de", "ten cong viec"],
  customer: ["khach hang", "ten khach", "lien quan"],
  staff: ["nguoi phu trach", "giao cho", "nguoi thuc hien", "nhan vien"],
  start: ["ngay bat dau", "bat dau"],
  type: ["loai cong viec", "phan loai", "loai"],
  status: ["trang thai", "tinh trang"],
};
const REQUIRED = ["customer", "staff", "start", "type", "status"] as const;

export type ScannedTask = {
  id: string;
  title: string;
  customer: string;
  customerCrmId: string | null;
  staff: string;
  type: string;
  status: string;
  startAt: Date;
};

type Get = Awaited<ReturnType<typeof crmSession>>;

function listParams(from: string, to: string, offset: number): Record<string, string> {
  return {
    module: "Tasks",
    action: "index",
    query: "true",
    to_pdf: "true",
    is_ajax_call: "true",
    offset: String(offset),
    limit: String(PAGE),
    // lọc theo ngày bắt đầu (kiểu lọc chung của incomSoft, spec R5)
    rpt_type: "range",
    date_from: from,
    date_to: to,
    // dự phòng: kiểu lọc nâng cao chuẩn của SugarCRM; bước tự kiểm bên dưới sẽ phát hiện nếu bộ lọc không ăn
    searchFormTab: "advanced_search",
    date_start_advanced_range_choice: "between",
    start_range_date_start_advanced: from,
    end_range_date_start_advanced: to,
  };
}

/** Đọc 1 trang danh sách → các dòng công việc + tổng số trên nhãn phân trang ("1 - 100 của N") */
function parseListPage(html: string) {
  const rows = tableRows(html);
  const head = rows.find((r) => r.isHead && r.cells.some((c) => fold(c).includes("bat dau")));
  if (!head) throw new Error("Không thấy bảng công việc (không có cột 'Ngày bắt đầu') — giao diện CRM có thể đã đổi");
  const heads = head.cells.map(fold);
  const col: Record<string, number> = {};
  for (const [key, names] of Object.entries(COLUMNS)) {
    for (const n of names) {
      const i = heads.findIndex((h, idx) => (h === n || h.startsWith(n)) && !Object.values(col).includes(idx));
      if (i >= 0) { col[key] = i; break; }
    }
  }
  const missing = REQUIRED.filter((k) => col[k] === undefined);
  if (missing.length) throw new Error(`Thiếu cột ${missing.join(", ")}. Các cột CRM đang có: ${head.cells.join(" | ")}`);

  const startIdx = rows.indexOf(head);
  const tasks: ScannedTask[] = [];
  const bad: string[] = [];
  for (const r of rows.slice(startIdx + 1)) {
    if (r.isHead || !/^\d+$/.test(r.cells[0] ?? "")) continue; // dòng dữ liệu bắt đầu bằng số thứ tự (R3)
    const id = r.html.match(/module=Tasks[^"']*?record=([\w-]+)/i)?.[1] ?? r.html.match(/record=([\w-]{8,})/)?.[1];
    const startAt = parseVnDate(r.cells[col.start] ?? "");
    if (!id || !startAt) { bad.push(r.cells.join(" | ").slice(0, 160)); continue; }
    const cell = (k: string) => (col[k] === undefined ? "" : r.cells[col[k]] ?? "");
    tasks.push({
      id,
      title: cell("title"),
      customer: cell("customer"),
      customerCrmId: (r.cellHtml[col.customer] ?? "").match(/record=([\w-]+)/)?.[1] ?? null,
      staff: cell("staff"),
      type: cell("type"),
      status: cell("status"),
      startAt,
    });
  }
  const t = text(html).match(/\(?\s*\d[\d.,]*\s*-\s*\d[\d.,]*\s*(?:của|of|\/)\s*(\d[\d.,]*)/i);
  const total = t ? Number(t[1].replace(/[.,]/g, "")) : null;
  return { tasks, total, bad, headers: head.cells };
}

/** Đọc hết các trang trong khoảng ngày. Ném lỗi (không trả dữ liệu thiếu) nếu bước tự kiểm không qua. */
export async function readTasks(get: Get, from: Date, to: Date) {
  const f = vnDay(from), t = vnDay(to);
  const byId = new Map<string, ScannedTask>();
  let total: number | null = null, headers: string[] = [], pages = 0;
  for (let offset = 0; pages < MAX_PAGES; offset += PAGE, pages++) {
    const page = parseListPage(await get(listParams(f, t, offset)));
    if (page.bad.length) throw new Error(`${page.bad.length} dòng không đọc được mã hoặc ngày, ví dụ: ${page.bad[0]}`);
    headers = page.headers;
    total ??= page.total;
    page.tasks.forEach((x) => byId.set(x.id, x));
    if (page.tasks.length < PAGE || (total !== null && byId.size >= total)) break;
  }
  const tasks = [...byId.values()];

  // ---- tự kiểm: sai bất kỳ điều nào thì dừng, không ghi gì ----
  if (pages >= MAX_PAGES) throw new Error(`Đọc quá ${MAX_PAGES} trang — bộ lọc ngày có thể không ăn`);
  if (total !== null && tasks.length !== total) throw new Error(`Đọc được ${tasks.length} công việc nhưng CRM báo ${total}`);
  const end = new Date(to.getTime() + 86400_000);
  const outside = tasks.filter((x) => x.startAt < from || x.startAt >= end);
  if (outside.length) throw new Error(`${outside.length}/${tasks.length} công việc nằm ngoài ${f} → ${t}: bộ lọc ngày không có tác dụng (ví dụ ${vnDay(outside[0].startAt)})`);
  return { tasks, total, headers };
}

/** Nội dung chi tiết 1 công việc: đọc cặp "nhãn: giá trị" ở trang chi tiết, lấy ô nội dung/mô tả */
const CONTENT_LABELS = ["noi dung", "mo ta", "ghi chu", "ket qua"];
export async function readTaskDetail(get: Get, id: string) {
  const html = await get({ module: "Tasks", action: "DetailView", record: id }, "GET");
  const pairs: Record<string, string> = {};
  for (const r of tableRows(html)) {
    for (let i = 0; i < r.cells.length - 1; i++) {
      const label = r.cells[i];
      if (/:\s*$/.test(label) && label.length < 60) pairs[label.replace(/:\s*$/, "").trim()] = r.cells[i + 1];
    }
  }
  const parts = CONTENT_LABELS.map((l) => Object.entries(pairs).find(([k, v]) => fold(k).startsWith(l) && v)?.[1]).filter(Boolean);
  return { content: parts.join(" — ") || null, pairs };
}

/** Ghi vào DB: thêm mới, cập nhật dòng đổi, đánh dấu công việc đã bị xóa trên CRM (chỉ trong khoảng vừa quét) */
export async function saveTasks(tasks: ScannedTask[], from: Date, to: Date, runId: string) {
  const end = new Date(to.getTime() + 86400_000);
  const old = new Map((await prisma.crmTask.findMany({ where: { id: { in: tasks.map((x) => x.id) } } })).map((x) => [x.id, x]));
  const fresh = tasks.filter((x) => !old.has(x.id));
  const changed = tasks.filter((x) => {
    const o = old.get(x.id);
    return o && (o.title !== x.title || o.customer !== x.customer || o.staff !== x.staff || o.type !== x.type || o.status !== x.status || o.startAt.getTime() !== x.startAt.getTime() || o.deletedAt);
  });
  const row = (x: ScannedTask) => ({ ...x, customerKey: fold(x.customer), lastRunId: runId, deletedAt: null });
  for (let i = 0; i < fresh.length; i += 500) await prisma.crmTask.createMany({ data: fresh.slice(i, i + 500).map(row), skipDuplicates: true });
  for (let i = 0; i < changed.length; i += 50) {
    // đổi tiêu đề/trạng thái thì đọc lại nội dung chi tiết ở bước sau
    await prisma.$transaction(changed.slice(i, i + 50).map((x) => prisma.crmTask.update({ where: { id: x.id }, data: { ...row(x), detailAt: null } })));
  }
  await prisma.crmTask.updateMany({ where: { id: { in: tasks.map((x) => x.id) } }, data: { lastRunId: runId, seenAt: new Date() } });
  const gone = await prisma.crmTask.updateMany({
    where: { startAt: { gte: from, lt: end }, deletedAt: null, NOT: { id: { in: tasks.map((x) => x.id) } } },
    data: { deletedAt: new Date() },
  });
  return { created: fresh.length, updated: changed.length, deleted: gone.count };
}

/** Đọc nội dung chi tiết cho các công việc chưa có, đến khi hết giờ — lần chạy sau đọc tiếp phần còn lại */
export async function fillDetails(get: Get, deadline: number) {
  const todo = await prisma.crmTask.findMany({ where: { detailAt: null, deletedAt: null }, orderBy: { startAt: "desc" }, select: { id: true }, take: 2000 });
  let done = 0;
  // 4 trang một lượt: nhanh gấp ~4 lần mà không dồn CRM
  for (let i = 0; i < todo.length && Date.now() < deadline; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async ({ id }) => {
      const d = await readTaskDetail(get, id);
      await prisma.crmTask.update({ where: { id }, data: { content: d.content, detailAt: new Date() } });
      done++;
    }));
  }
  return { done, left: todo.length - done };
}
