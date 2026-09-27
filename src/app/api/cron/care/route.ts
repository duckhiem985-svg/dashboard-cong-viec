import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCareReport } from "@/lib/crm";
import { markSynced, saveCareEntries } from "@/lib/ingest";

export const maxDuration = 300;

// Vercel Cron gọi mỗi ngày (xem vercel.json), header Authorization: Bearer <CRON_SECRET>.
// Chạy tay: ?date=dd/mm/yyyy để lấy ngày khác, &dry=1 để chỉ xem kết quả, không ghi DB.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  // Hôm qua theo giờ Việt Nam (UTC+7)
  const y = new Date(Date.now() + 7 * 3600_000 - 86400_000);
  const day =
    params.get("date") ??
    [y.getUTCDate(), y.getUTCMonth() + 1].map((n) => String(n).padStart(2, "0")).join("/") + `/${y.getUTCFullYear()}`;

  try {
    const report = await fetchCareReport(day);
    console.log("cron/care", day, `dry=${!!params.get("dry")}`, `count=${report.count}`, `customers=${report.customers}`, `entries=${report.entries.length}`);
    if (params.get("dry")) return NextResponse.json({ dry: true, ...report });

    // Ghi đè dữ liệu của ngày này để chạy lại / nhập liệu trễ không bị trùng
    const start = new Date(day.split("/").reverse().join("-"));
    await prisma.careLog.deleteMany({
      where: { date: { gte: start, lt: new Date(start.getTime() + 86400_000) } },
    });
    const created = await saveCareEntries(report.entries);
    await markSynced("customers", "incomsoft_crm_cron", `${day}: ${report.count} khách, ${created} hoạt động`);

    return NextResponse.json({ ok: true, day, count: report.count, customers: report.customers, created });
  } catch (e) {
    // Không markSynced để dashboard không báo "đã cập nhật" khi thật ra lỗi; xem lỗi trong Vercel Logs
    const message = e instanceof Error ? e.message : String(e);
    console.error("cron/care", day, message);
    return NextResponse.json({ ok: false, day, error: message }, { status: 500 });
  }
}
