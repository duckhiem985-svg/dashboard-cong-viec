import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crmSession, parseVnDate, tableRows, vnDay } from "@/lib/crm";
import { fillDetails, readTaskDetail, readTasks, saveTasks } from "@/lib/crm-tasks";
import { markSynced } from "@/lib/ingest";

export const maxDuration = 300;

const DAY = 86400_000;
const DAILY_DAYS = 14; // mỗi ngày quét lại 14 ngày gần nhất: bắt được lượt nhập trễ và lượt đổi trạng thái
const FIRST_DAYS = 60; // lần đầu (DB trống) lấy 60 ngày

// Vercel Cron gọi mỗi sáng (xem vercel.json), header Authorization: Bearer <CRON_SECRET>.
// Chạy tay (cùng header):
//   ?from=dd/mm/yyyy&to=dd/mm/yyyy  quét khoảng ngày khác (to mặc định = hôm nay)
//   ?probe=1                         chỉ xem CRM trả về gì (cột, vài dòng mẫu), không ghi DB
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return await scan(req);
  } catch (e) {
    // lỗi trước khi kịp ghi nhật ký (DB không kết nối được, CRM không đăng nhập được khi dò thử...)
    const error = e instanceof Error ? e.message : String(e);
    console.error("cron/tasks FAILED", error);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}

async function scan(req: NextRequest) {
  const t0 = Date.now();
  const p = req.nextUrl.searchParams;
  const vnToday = parseVnDate(vnDay(new Date()))!;
  const to = (p.get("to") && parseVnDate(p.get("to")!)) || vnToday;
  let from = p.get("from") ? parseVnDate(p.get("from")!) : null;
  // dò thử chỉ đọc CRM, không đụng DB
  if (!from && p.get("probe")) from = new Date(to.getTime() - DAILY_DAYS * DAY);
  if (!from) from = new Date(to.getTime() - ((await prisma.crmTask.count()) ? DAILY_DAYS : FIRST_DAYS) * DAY);
  if (from > to) return NextResponse.json({ error: "from phải trước to" }, { status: 400 });

  if (p.get("probe")) return probe(from, to);

  const run = await prisma.crmScanRun.create({
    data: { job: "tasks", trigger: req.headers.get("user-agent")?.includes("vercel-cron") ? "cron" : "manual", windowFrom: from, windowTo: to },
  });
  try {
    const get = await crmSession();
    const { tasks } = await readTasks(get, from, to);
    const saved = await saveTasks(tasks, from, to, run.id);
    // phần thời gian còn lại dùng đọc nội dung chi tiết; chưa xong thì lần sau đọc tiếp
    const det = await fillDetails(get, t0 + 240_000);
    const result = { rows: tasks.length, ...saved, details: det.done, detailsLeft: det.left };
    await prisma.crmScanRun.update({ where: { id: run.id }, data: { ok: true, finishedAt: new Date(), ...result } });
    await markSynced("crm_tasks", "incomsoft_crm_cron", `${vnDay(from)} → ${vnDay(to)}: ${tasks.length} công việc`);
    console.log("cron/tasks ok", vnDay(from), vnDay(to), JSON.stringify(result), `${Math.round((Date.now() - t0) / 1000)}s`);
    return NextResponse.json({ ok: true, from: vnDay(from), to: vnDay(to), ...result });
  } catch (e) {
    // không markSynced: dashboard vẫn hiện dữ liệu cũ + giờ quét cũ, không báo "đã cập nhật" sai
    const error = e instanceof Error ? e.message : String(e);
    await prisma.crmScanRun.update({ where: { id: run.id }, data: { finishedAt: new Date(), error: error.slice(0, 2000) } }).catch(() => {});
    console.error("cron/tasks FAILED", vnDay(from), vnDay(to), error);
    return NextResponse.json({ ok: false, from: vnDay(from), to: vnDay(to), error }, { status: 500 });
  }
}

/** Xem CRM trả về gì để chỉnh bộ đọc khi giao diện CRM đổi. Không ghi DB. */
async function probe(from: Date, to: Date) {
  const get = await crmSession();
  const out: Record<string, unknown> = { from: vnDay(from), to: vnDay(to) };
  try {
    const r = await readTasks(get, from, to);
    out.ok = true;
    out.total = r.total;
    out.read = r.tasks.length;
    out.headers = r.headers;
    out.sample = r.tasks.slice(0, 3);
    if (r.tasks[0]) out.detailSample = (await readTaskDetail(get, r.tasks[0].id)).pairs;
  } catch (e) {
    out.ok = false;
    out.error = e instanceof Error ? e.message : String(e);
    // in ra vài dòng bảng thô để biết phải sửa bộ đọc thế nào
    const html = await get({ module: "Tasks", action: "index", query: "true", to_pdf: "true", is_ajax_call: "true", offset: "0", limit: "5" });
    out.rawRows = tableRows(html).filter((r) => r.cells.some(Boolean)).slice(0, 15).map((r) => (r.isHead ? "TH: " : "TD: ") + r.cells.join(" | ").slice(0, 300));
    out.rawLinks = [...new Set(html.match(/index\.php\?[^"'\s]{0,160}/g) ?? [])].slice(0, 15);
  }
  return NextResponse.json(out);
}
