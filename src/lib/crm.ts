// Lấy báo cáo chăm sóc khách hàng từ CRM incomSoft bằng HTTP thuần (không cần trình duyệt).
// Tái hiện đúng các request mà trang Customer_Cares gọi khi bấm tay.
import type { CareEntry } from "@/lib/ingest";

const BASE = "https://giaytoanquoc.incomsoft.vn/index.php";
const STATUSES = "Hoàn tất|Chưa xử lý|Đang thực hiện|Đã hủy";

async function login(): Promise<string> {
  const res = await fetch(BASE, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      module: "Users",
      action: "Authenticate",
      return_module: "Users",
      return_action: "Login",
      login_module: "Home",
      login_action: "index",
      userStyle: "Sales",
      user_name: process.env.CRM_USERNAME ?? "",
      user_password: process.env.CRM_PASSWORD ?? "",
    }),
  });
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  if (!cookie) throw new Error(`CRM login: không nhận được cookie (HTTP ${res.status})`);
  return cookie;
}

async function crm(cookie: string, params: Record<string, string>, method = "POST") {
  const body = new URLSearchParams(params);
  const res = await fetch(method === "GET" ? `${BASE}?${body}` : BASE, {
    method,
    headers: { cookie, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : body,
  });
  const html = await res.text();
  if (html.includes('name="user_password"')) throw new Error("CRM login thất bại (sai tài khoản/mật khẩu?)");
  return html;
}

function text(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** day: "dd/mm/yyyy" */
export async function fetchCareReport(day: string) {
  const cookie = await login();
  const base = {
    date_from: day,
    date_to: day,
    module: "Customer_Cares",
    action: "index",
    query: "true",
    to_pdf: "true",
    is_ajax_call: "true",
  };

  // 1. Số khách "Đã chăm sóc" trong bảng "Tổng hợp kết quả Chăm sóc"
  const summary = await crm(cookie, { ...base, isSummary: "true", loadGroup: "tasks_care" });
  const count = Number(summary.match(/title="Đã chăm sóc">\s*(\d+)\s*</)?.[1] ?? NaN);
  if (Number.isNaN(count)) throw new Error("Không đọc được số khách đã chăm sóc");

  // 2. Danh sách khách = bấm vào số đó
  const customers: { id: string; name: string }[] = [];
  if (count > 0) {
    const list = await crm(cookie, {
      ...base,
      offset: "0",
      limit: String(Math.max(count, 100)),
      params: "type=all&care=yes&level=all&field=transaction_level",
    });
    const re = /<td[^>]*class="[^"]*acc-info[^"]*"[^>]*>[\s\S]*?<a[^>]*href="[^"]*record=([\w-]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    for (const m of list.matchAll(re)) customers.push({ id: m[1], name: text(m[2]) });
  }

  // 3. Tab "Hoạt động" của từng khách, lọc đúng ngày
  const entries: CareEntry[] = [];
  const isoDate = day.split("/").reverse().join("-");
  for (const c of customers) {
    const html = await crm(
      cookie,
      { to_pdf: "1", module: "MySettings", action: "LoadTabSubpanels", loadModule: "Accounts", record: c.id, subpanels: "activities" },
      "GET",
    );
    const t = text(html);
    const body = t.slice(t.indexOf("Người thực hiện") + "Người thực hiện".length);
    for (const row of body.split(new RegExp(`(?= (?:${STATUSES}) )`))) {
      if (!row.includes(day)) continue;
      // "<Tình trạng> <Phân loại/Tiêu đề/Nội dung> <bắt đầu> <hoàn thành> ... <NHÂN VIÊN> sửa"
      const m = row.trim().match(new RegExp(`^(?:${STATUSES})\\s+(.*?)\\s+(\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2})(?:\\s+\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2})*\\s+(.*?)\\s*sửa\\b`));
      if (!m) continue;
      entries.push({
        customerName: c.name,
        salesName: m[3] || "Không rõ",
        note: `${m[1]} (${m[2].slice(11)})`,
        date: isoDate,
      });
    }
  }

  return { day, count, customers: customers.length, entries };
}
