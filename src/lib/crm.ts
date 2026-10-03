// Đọc CRM incomSoft (SugarCRM) bằng HTTP thuần (không cần trình duyệt).
// Chỉ đọc, không ghi gì vào CRM.

const BASE = "https://giaytoanquoc.incomsoft.vn/index.php";
const TIMEOUT_MS = 30_000;

/** fetch có hẹn giờ + thử lại 3 lần (CRM thỉnh thoảng chậm hoặc rớt kết nối) */
async function fetchRetry(url: string, init: RequestInit): Promise<Response> {
  let last: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status >= 500) throw new Error(`CRM trả HTTP ${res.status}`);
      return res;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error(`Không kết nối được CRM sau 3 lần thử: ${last instanceof Error ? last.message : String(last)}`);
}

async function login(): Promise<string> {
  if (!process.env.CRM_USERNAME || !process.env.CRM_PASSWORD) throw new Error("Thiếu CRM_USERNAME / CRM_PASSWORD trong biến môi trường");
  const res = await fetchRetry(BASE, {
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
      user_name: process.env.CRM_USERNAME,
      user_password: process.env.CRM_PASSWORD,
    }),
  });
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  if (!cookie) throw new Error(`CRM login: không nhận được cookie (HTTP ${res.status})`);
  return cookie;
}

/** Phiên CRM: tự đăng nhập lại 1 lần nếu phiên hết hạn giữa chừng */
export async function crmSession() {
  let cookie = await login();
  return async function get(params: Record<string, string>, method: "GET" | "POST" = "POST"): Promise<string> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const body = new URLSearchParams(params);
      const res = await fetchRetry(method === "GET" ? `${BASE}?${body}` : BASE, {
        method,
        headers: { cookie, "Content-Type": "application/x-www-form-urlencoded" },
        body: method === "GET" ? undefined : body,
      });
      const html = await res.text();
      if (!html.includes('name="user_password"')) return html;
      if (attempt === 0) cookie = await login();
    }
    throw new Error("CRM login thất bại (sai tài khoản/mật khẩu, hoặc tài khoản bị khóa?)");
  };
}

export function text(html: string) {
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

/** bỏ dấu, chữ thường, chỉ giữ a-z0-9 (quy tắc R7 của spec, dùng để ghép tên) */
export function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** "dd/mm/yyyy" hoặc "dd/mm/yyyy hh:mm" giờ Việt Nam → Date (UTC) */
export function parseVnDate(s: string): Date | null {
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, d, mo, y, h = "0", mi = "0"] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h - 7, +mi));
}

/** Date → "dd/mm/yyyy" theo giờ Việt Nam */
export function vnDay(dt: Date) {
  const x = new Date(dt.getTime() + 7 * 3600_000);
  return [x.getUTCDate(), x.getUTCMonth() + 1].map((n) => String(n).padStart(2, "0")).join("/") + `/${x.getUTCFullYear()}`;
}

/** Tách bảng HTML thành các dòng; mỗi dòng giữ html gốc (để lấy link) và chữ từng ô */
export function tableRows(html: string) {
  const rows: { html: string; cells: string[]; cellHtml: string[]; isHead: boolean }[] = [];
  for (const chunk of html.split(/<tr\b/i).slice(1)) {
    const end = chunk.search(/<\/tr>/i);
    const tr = end >= 0 ? chunk.slice(0, end) : chunk;
    const cellHtml = [...tr.matchAll(/<t([dh])\b[^>]*>([\s\S]*?)(?=<t[dh]\b|$)/gi)].map((m) => m[2].replace(/<\/t[dh]>\s*$/i, ""));
    rows.push({ html: tr, cellHtml, cells: cellHtml.map(text), isHead: /<th\b/i.test(tr) });
  }
  return rows;
}
