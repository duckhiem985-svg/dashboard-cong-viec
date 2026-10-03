// Kiểm thử bộ đọc Tasks bằng HTML giả lập kiểu SugarCRM (không gọi CRM thật, không cần DB).
// Chạy: npx tsx scripts/test-crm-tasks.ts
import { parseVnDate, tableRows, vnDay } from "../src/lib/crm";
import { readTaskDetail, readTasks } from "../src/lib/crm-tasks";

let pass = 0, fail = 0;
function ok(cond: unknown, msg: string) { if (cond) pass++; else fail++; console.log((cond ? "PASS " : "FAIL ") + msg); }
async function throws(p: Promise<unknown>, re: RegExp, msg: string) {
  try { await p; ok(false, msg + " (không ném lỗi)"); } catch (e) { const m = e instanceof Error ? e.message : String(e); ok(re.test(m), msg + " → " + m); }
}

type T = { id: string; d: string; cust?: string };
function page(rows: T[], offset: number, total: number, opts: { noHead?: boolean; badDate?: boolean } = {}) {
  const head = opts.noHead ? "" : `<tr height="20"><th scope="col" width="1%">&nbsp;</th><th scope="col"><a href="#" class="listViewThLinkS1">Tiêu đề</a>&nbsp;<img src="x.gif"></th>
    <th scope="col">Khách hàng</th><th scope="col">Người phụ trách</th><th scope="col">Ngày bắt đầu</th><th scope="col">Loại công việc</th><th scope="col">Trạng thái</th></tr>`;
  const body = rows.map((r, i) => `<tr class="oddListRowS1"><td>${offset + i + 1}</td>
    <td><a href="index.php?module=Tasks&amp;action=DetailView&amp;record=${r.id}">Gọi lại &amp; báo giá ${r.id}</a></td>
    <td><a href="index.php?module=Accounts&action=DetailView&record=acc-${r.id}">${r.cust ?? "Công ty Đông Á"}</a></td>
    <td>Trúc</td><td>${opts.badDate ? "??" : r.d}</td><td>Báo Giá</td><td>Hoàn tất</td></tr>`).join("\n");
  const pager = `<span class="pageNumbers">(${offset + 1} - ${offset + rows.length} của ${total})</span>`;
  return `<table class="list view"><tr class="pagination"><td>${pager}</td></tr>${head}${body}</table>`;
}
function fakeCrm(all: T[], opts: { ignoreFilter?: boolean; total?: number; noHead?: boolean; badDate?: boolean } = {}) {
  const calls: Record<string, string>[] = [];
  const get = async (p: Record<string, string>) => {
    calls.push(p);
    const from = parseVnDate(p.date_from)!, to = new Date(parseVnDate(p.date_to)!.getTime() + 86400_000);
    const rows = opts.ignoreFilter ? all : all.filter((r) => { const d = parseVnDate(r.d)!; return d >= from && d < to; });
    const off = +p.offset;
    return page(rows.slice(off, off + +p.limit), off, opts.total ?? rows.length, opts);
  };
  return { get, calls };
}
function mk(n: number, startDay: number): T[] {
  return Array.from({ length: n }, (_, i) => ({ id: `t${String(i).padStart(4, "0")}-aaaa`, d: `${String(startDay + (i % 20)).padStart(2, "0")}/09/2026 ${String(8 + (i % 10)).padStart(2, "0")}:15` }));
}

(async () => {
  // ngày giờ VN
  const d = parseVnDate("03/10/2026 15:30")!;
  ok(d.toISOString() === "2026-10-03T08:30:00.000Z", "15:30 giờ VN = 08:30 UTC: " + d.toISOString());
  ok(vnDay(new Date("2026-10-02T17:30:00Z")) === "03/10/2026", "00:30 sáng VN ngày 03/10 vẫn là ngày 03/10");
  ok(parseVnDate("1/9/2026")!.toISOString() === "2026-08-31T17:00:00.000Z", "ngày 1 chữ số đọc được");

  // bảng
  const tr = tableRows(page(mk(2, 1), 0, 2));
  ok(tr.filter((r) => r.isHead).length === 1 && tr.find((r) => r.isHead)!.cells[1] === "Tiêu đề", "tách tiêu đề cột, bỏ link/ảnh: " + tr.find((r) => r.isHead)!.cells.join("|"));
  ok(tr.some((r) => r.cells[1] === "Gọi lại & báo giá t0000-aaaa"), "giải mã &amp; trong ô");

  // 1 trang
  const from = parseVnDate("01/09/2026")!, to = parseVnDate("30/09/2026")!;
  const a = fakeCrm(mk(37, 1));
  const r1 = await readTasks(a.get, from, to);
  ok(r1.tasks.length === 37 && a.calls.length === 1, "37 công việc, 1 trang: " + r1.tasks.length + ", gọi " + a.calls.length + " lần");
  const t0 = r1.tasks[0];
  ok(t0.id === "t0000-aaaa" && t0.customer === "Công ty Đông Á" && t0.customerCrmId === "acc-t0000-aaaa" && t0.staff === "Trúc" && t0.type === "Báo Giá" && t0.status === "Hoàn tất", "đọc đúng các cột: " + JSON.stringify(t0));
  ok(a.calls[0].date_from === "01/09/2026" && a.calls[0].date_to === "30/09/2026" && a.calls[0].limit === "100", "gửi đúng khoảng ngày dd/mm/yyyy, 100 dòng/trang");

  // nhiều trang
  const b = fakeCrm(mk(250, 1));
  const r2 = await readTasks(b.get, from, to);
  ok(r2.tasks.length === 250 && b.calls.length === 3 && b.calls.map((c) => c.offset).join(",") === "0,100,200", "250 công việc qua 3 trang (offset 0,100,200)");
  const c = fakeCrm(mk(200, 1));
  const r3 = await readTasks(c.get, from, to);
  ok(r3.tasks.length === 200 && c.calls.length === 2, "đúng 200 (trang chẵn 100): dừng sau 2 trang, không gọi trang rỗng: " + c.calls.length);

  // tự kiểm
  await throws(readTasks(fakeCrm(mk(120, 1), { total: 130 }).get, from, to), /Đọc được 120 .* CRM báo 130/, "thiếu dòng so với CRM báo → dừng");
  const mixed = mk(30, 1).concat([{ id: "old1-aaaa", d: "15/08/2026 09:00" }]);
  await throws(readTasks(fakeCrm(mixed, { ignoreFilter: true }).get, from, to), /ngoài 01\/09\/2026 → 30\/09\/2026: bộ lọc ngày không có tác dụng/, "CRM bỏ qua bộ lọc ngày → dừng");
  await throws(readTasks(fakeCrm(mk(5, 1), { noHead: true }).get, from, to), /Không thấy bảng công việc/, "CRM đổi giao diện (mất dòng tiêu đề) → dừng");
  await throws(readTasks(fakeCrm(mk(5, 1), { badDate: true }).get, from, to), /không đọc được mã hoặc ngày/, "ngày không đọc được → dừng");
  const weird = async () => page(mk(3, 1), 0, 3).replace("Người phụ trách", "Phụ trách chính");
  await throws(readTasks(weird, from, to), /Thiếu cột staff\. Các cột CRM đang có: .*Phụ trách chính/, "đổi tên cột → báo rõ thiếu cột nào + cột đang có");
  // biên: công việc 30/09 23:59 nằm trong khoảng, 01/10 00:00 thì không
  const edge = fakeCrm([{ id: "e1-aaaaaa", d: "30/09/2026 23:59" }, { id: "e2-aaaaaa", d: "01/09/2026 00:00" }]);
  ok((await readTasks(edge.get, from, to)).tasks.length === 2, "biên khoảng ngày: 01/09 00:00 và 30/09 23:59 đều tính");

  // trang chi tiết
  const det = await readTaskDetail(async () => `<table><tr><td scope="col">Tiêu đề:</td><td>Gọi lại</td><td scope="col">Trạng thái:</td><td>Hoàn tất</td></tr>
    <tr><td scope="col">Nội dung:</td><td colspan="3">Khách chê giá cao, <b>chờ duyệt</b> giá mới</td></tr></table>`, "x");
  ok(det.content === "Khách chê giá cao, chờ duyệt giá mới" && det.pairs["Trạng thái"] === "Hoàn tất", "đọc nội dung chi tiết: " + det.content);

  console.log(`\n${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
