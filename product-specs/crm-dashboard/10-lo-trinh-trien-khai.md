# 10 — Lộ trình triển khai

> 8 giai đoạn (GĐ0 → GĐ7). Mỗi giai đoạn: **mục tiêu · cần có trước · việc cụ thể (kèm file) · kiểm thử · điều kiện xong · rủi ro · ước lượng**.
> Ước lượng tính bằng **phiên làm việc** (một buổi làm cùng Claude, khoảng 1–3 giờ), không phải ngày lịch.
> Chi tiết kỹ thuật của từng việc nằm ở các file 04–09, 11 (viết dần ở các lượt sau).

## Sơ đồ phụ thuộc

```
GĐ0 Chuẩn bị + khảo sát CRM
  │
  ▼
GĐ1 Nền dữ liệu + bộ quét CSKH ──────────────┐
  │                                           │
  ▼                                           ▼
GĐ2 Tính số CSKH + tái tạo số 03/10      GĐ6 Trang Kho·Xuất bán·Công nợ (V2, sau GĐ5 theo Q11-A)
  │                                           ▲
  ▼                                           │
GĐ3 Giao diện CSKH (chưa AI) ──► GĐ4 Lớp AI ──► GĐ5 Theo dõi câu hỏi + chốt kỳ
                                                  │
                                                  ▼
                                          GĐ7 Vận hành + chuyển giao (tắt hệ cũ)
```

**Mốc cho client xem (demo):** sau GĐ2 (bảng so số), sau GĐ3 (trang thật, chưa AI), sau GĐ4 (đủ chức năng CSKH), sau GĐ6 (trang 2).

---

## GĐ0 — Chuẩn bị và khảo sát nguồn CRM

**Mục tiêu:** biết **chính xác** từng con số lấy từ request nào, tham số nào, cột nào, trước khi viết một dòng code dữ liệu.

**Cần có trước:**
- Client trả lời các quyết định chặn GĐ0–GĐ1: Q1, Q9, Q13 (xem [01](01-quyet-dinh.md)).
- **Máy làm việc cài Node.js** (hiện chưa có — không chạy được lint/build/test ở local). Sau đó `npm ci`.
- Phiên trình duyệt trong app Claude đăng nhập sẵn CRM (người dùng tự đăng nhập, Claude không nhập mật khẩu) — giống lần khảo sát `Customer_Cares`.

**Việc:**
1. **Dọn an toàn:** thêm `crm-dashboard-spec/` vào `.gitignore`; đổi `INGEST_API_KEY` trên Vercel (key cũ đã lộ trong chat); chạy thử `curl …/api/cron/care?date=26/09/2026&dry=1` còn treo từ trước để xác nhận Vercel gọi được CRM (nếu bị chặn IP → đổi region `sin1` ngay từ đây).
2. **Khảo sát `Tasks`** (nguồn CSKH): URL danh sách, tham số lọc theo ngày bắt đầu (`type_date_start`, khoảng ngày), cách phân trang AJAX, giới hạn dòng/trang; danh sách cột; **mã công việc**, **mã khách (account id)**, người phụ trách (tên hay mã), loại công việc, trạng thái, tiêu đề, nội dung — có nằm sẵn trong danh sách không hay phải mở trang chi tiết; danh sách giá trị thật của "loại công việc".
3. **Khảo sát `TQT_Product_Stocks`:** cách đổi `limit` 100, phân trang, dòng nhóm vs dòng sản phẩm, dòng tổng vàng, 14 cột (spec 2.1).
4. **Khảo sát `Warehouse_Outs`:** lọc `rpt_type=range`, ô tóm tắt trạng thái, 14 cột (spec 2.2), mã phiếu làm khóa.
5. **Khảo sát `Debit_Bills`:** khối tổng hợp (đủ cột Đầu kỳ Có/Cuối kỳ Có — giải vấn đề B3), bảng 26 cột, **5 khách thiếu người phụ trách** (B1), thành phần cột 9 (B2).
6. **Đo thời gian** từng request và kích thước trang → điền bảng ước lượng bước quét ở file 03 mục 3.
7. **Lưu mẫu HTML** mỗi loại trang, **ẩn danh hóa** (thay tên khách/số tiền) làm fixture kiểm thử ở `src/lib/crm/__fixtures__/`.
8. Kiểm tra CRM có đá phiên người dùng khi bot đăng nhập không (Q9).
9. Đánh giá Vercel Workflows trên gói hiện tại (thay cho chuỗi tự gọi — file 03 mục 3).

**Kết quả:** file `04-nguon-du-lieu-crm.md` điền đầy đủ; fixture ẩn danh; bảng thời gian.

**Điều kiện xong:** mọi chỉ số trong file 06 và 07 đều chỉ ra được **request + cột nguồn**; mục nào CRM không cung cấp được ghi rõ "không lấy được" kèm phương án.

**Rủi ro:** `Tasks` không có mã khách trong danh sách → phải mở chi tiết từng công việc (chậm) → ảnh hưởng thiết kế bước 2 của chuỗi quét. CRM chặn IP nước ngoài → đổi region.

**Ước lượng:** 2–3 phiên.

---

## GĐ1 — Nền dữ liệu và bộ quét CSKH

**Mục tiêu:** hệ thống tự quét `Tasks` mỗi ngày, lưu vào DB không trùng, có lịch sử từ 01/08.

**Cần có trước:** GĐ0 xong; Q13 chốt.

**Việc:**
1. **Bảng dữ liệu** (chi tiết ở file 05) trong `prisma/schema.prisma`: `ScanRun`, `CrmTask`, `CrmAccount` (+ bí danh gộp trùng), `AppSetting` (tham số Q14), `ReviewCheckpoint` (mốc kỳ Q3), `DashboardSnapshot`.
2. **Cách cập nhật DB an toàn:** repo đang dùng `prisma db push` (không có migration). Trước khi đẩy schema lên Neon production: tạo **nhánh Neon** để thử; cân nhắc chuyển sang `prisma migrate` để có lịch sử thay đổi. Không động vào bảng cũ (`Customer`, `CareLog`, …).
3. **Thư viện CRM:** tách `src/lib/crm.ts` thành `src/lib/crm/session.ts`, `table.ts`, `tasks.ts` (file 03 mục 2). Giữ hàm `Customer_Cares` cũ trong `customer-cares.ts` cho phép đối chiếu (Q1-B).
4. **Chuỗi quét:** `src/app/api/cron/scan/route.ts` (khởi tạo + khóa), `src/app/api/scan/step/route.ts` (chạy bước, lưu tiến độ, tự gọi bước kế), đồng hồ an toàn 270 s.
5. **Bước quét Tasks:** gia tăng (lần thành công trước − 3 ngày) + đầy đủ hằng tuần; ghi bằng upsert theo mã công việc; khử trùng R6 chỉ còn là lớp dự phòng khi thiếu mã.
6. **Nạp lịch sử 01/08 → nay** (chạy tay nhiều lô).
7. **Trang quản trị tối giản** `/admin/scans` (ADMIN): danh sách lần quét, trạng thái, số bản ghi, lỗi. Phục vụ chính mình khi vận hành.
8. `vercel.json`: thêm cron mới; giữ cron `/api/cron/care` theo Q1.

**Kiểm thử:**
- Parser bảng chạy trên fixture ẩn danh (dùng `node --test` + `tsx` đã có trong devDependencies — không thêm thư viện test).
- Chạy quét 2 lần liên tiếp → số bản ghi không đổi (không trùng).
- Giả lập bị cắt giữa chừng → lần sau đọc tiếp đúng chỗ.
- So số công việc 3 ngày bất kỳ với màn hình CRM.

**Điều kiện xong:** cron chạy thật 3 ngày liên tiếp thành công; lịch sử từ 01/08 có trong DB; đếm theo ngày khớp CRM khi kiểm tay.

**Rủi ro:** thời gian quét chi tiết vượt dự kiến → tăng số bước/lô. Neon dung lượng → theo Q13.

**Ước lượng:** 3–4 phiên.

---

## GĐ2 — Tính số CSKH và tái tạo số 03/10

**Mục tiêu:** bộ tính số cho ra **đúng các con số client đã thấy** (170 lượt, 113 khách, 41 đặt hàng, 9 báo giá, 30 chưa follow-up, 121 tồn đọng, nhóm theo nhân viên, 9 tuần…) — đây là phép thử chất lượng quan trọng nhất của cả dự án.

**Cần có trước:** GĐ1; Q3, Q4, Q5, Q12 chốt.

**Việc:**
1. Hàm thuần trong `src/lib/dashboard/cskh/` theo công thức file 06: KPI, staff_stats, weeks, khach_chua_follow_up (chưa có nhóm AI), đối chiếu mốc, dải ngưng báo cáo (từ `ScanRun`).
2. Sửa các lỗi định nghĩa: B4 (số lượt từ mốc), B7, B8, B9, C1–C7 (bỏ cứng ngày/nhân viên).
3. **Phép tái tạo:** chạy bộ tính với kỳ 23/09 → 03/10 15:30, mốc tồn đọng 10/08 → xuất **bảng so sánh** từng số với `dashboard_data.json`.
4. Giải thích từng chênh lệch (nhân viên sửa/nhập trễ sau 03/10, khác định nghĩa đã sửa có chủ đích…).
5. Ghi `DashboardSnapshot` loại `cskh` sau mỗi lần quét (chưa có phần AI).

**Kiểm thử:** kiểm từng hàm với dữ liệu nhỏ tự dựng (khách nhiều lượt, khách 2 nhân viên, lượt đúng mốc 3 ngày, tuần dở dang, Chủ nhật, khách trùng tên).

**Điều kiện xong:** client xem bảng so sánh và đồng ý các chênh lệch có lý do. **Demo #1.**

**Ước lượng:** 2–3 phiên.

---

## GĐ3 — Giao diện trang CSKH (dữ liệu thật, chưa AI)

**Mục tiêu:** trang CSKH chạy trên dữ liệu thật, đúng bố cục bản mẫu, mọi khối số liệu hoạt động; khối văn bản AI tạm ẩn.

**Cần có trước:** GĐ2; Q2, Q10 chốt. Đọc tài liệu Next.js trong `node_modules/next/dist/docs/` theo `AGENTS.md` (Next 16 có thay đổi so với kiến thức cũ).

**Việc** (chi tiết component ở file 09):
1. Token giao diện + font (Be Vietnam Pro, Barlow Condensed, IBM Plex Mono qua `next/font`, kiểm tra hỗ trợ tiếng Việt), sáng/tối.
2. Header + banner trạng thái (từ `ScanRun`), dòng meta, nút "Quét lại" (ADMIN).
3. 4 thẻ KPI có ngưỡng màu.
4. Bảng Theo nhân viên (cột đếm từ danh sách, quy tắc tô đỏ < 40% trung bình).
5. Biểu đồ cột chồng SVG theo tuần (dải ngưng tự sinh, cột dở dang viền đứt, tooltip bàn phím, bảng số liệu ẩn).
6. Danh sách Khách chưa follow-up: 4 tầng lọc, lưu `localStorage`, nhóm theo G→K, nhãn số ngày 4 màu, mở rộng ghi chú.
7. Đối chiếu với mốc trước: thanh 3 đoạn + số (D3).
8. Khối "Cách tính" sinh từ cấu hình.
9. Bộ chọn kỳ + nút "Chốt kỳ" (Q3-C).
10. Chế độ "Theo ngày" (Q1-B): chuyển trang `/customers` cũ sang đọc từ `CrmTask`.
11. Phân quyền theo Q10.

**Kiểm thử:** 1366×768, 1440×900, điện thoại 390 px; chế độ tối; bàn phím; zoom 200%; danh sách 0/1/121/300 khách; dữ liệu cũ/lỗi/chưa có lần quét nào.

**Điều kiện xong:** client so với ảnh chụp bản mẫu và duyệt. **Demo #2.**

**Ước lượng:** 4–6 phiên.

---

## GĐ4 — Lớp AI

**Mục tiêu:** tự phân nhóm khách và tự soạn "Việc cần giao ngay", "Câu hỏi đốc thúc", diễn giải biểu đồ, nhóm ưu tiên — chất lượng tương đương bản client đang dùng, **không bịa số**.

**Cần có trước:** GĐ3; Q6, Q7 chốt; API key do client tự nhập vào Vercel. Tra cứu tài liệu Claude API hiện hành (model, giá, cách gọi) khi bắt đầu.

**Việc** (chi tiết ở file 08):
1. Phân nhóm: prompt có định nghĩa 7 nhóm + ví dụ lấy từ dữ liệu 03/10 (đã ẩn danh); bộ đệm theo mã băm ghi chú; chị sửa tay thắng AI.
2. Sinh văn bản từ **gói dữ kiện có cấu trúc** (số đã tính + trích ghi chú) — AI không tự đọc DB.
3. Tự kiểm số + kiểm tên khách (phải có trong dữ liệu) → loại/sinh lại câu sai.
4. Nút sửa/ẩn từng câu (Q7-B), lưu chỉnh sửa.
5. Đo chi phí mỗi lần chạy, ghi vào `ScanRun`.
6. **Chạy song song 1 tuần** (AI soạn nhưng chỉ chị xem) trước khi bật cho người khác.

**Điều kiện xong:** sau 1 tuần chạy thử, client đánh giá ≥ 90% nhóm đúng và văn bản dùng được không cần sửa nhiều. **Demo #3.**

**Ước lượng:** 3–4 phiên.

---

## GĐ5 — Theo dõi câu hỏi và chốt kỳ

**Mục tiêu:** dashboard thành công cụ quản lý vòng lặp: hỏi → trả lời → kiểm tra hôm sau.

**Việc:**
1. Bảng `ActionItemStatus` với **khóa ổn định** cho mỗi câu hỏi (theo loại + mã khách/mã phiếu, không theo câu chữ AI) để trạng thái giữ qua các ngày.
2. Nút Sao chép cả nhóm / từng câu; Đã gửi / Đã trả lời / Đạt + ghi chú.
3. Tự đánh dấu "Có thể đã xử lý" khi CRM có lượt mới cho khách đó.
4. Hoàn thiện "Chốt kỳ" + xem kỳ cũ + đối chiếu mốc đã chọn.
5. (Nếu Q10 bật) màn "Việc của tôi" cho nhân viên.

**Điều kiện xong:** chạy 1 tuần thật, trạng thái giữ đúng qua các lần quét.

**Ước lượng:** 2–3 phiên.

---

## GĐ6 — Trang Kho · Xuất bán · Công nợ (V2)

**Mục tiêu:** trang 2 theo `dashboard_ui_spec.md` mục 3, số liệu tự quét.

**Việc:**
1. Bộ quét `stocks.ts`, `warehouse-outs.ts`, `debts.ts` + các cổng kiểm tra riêng (file 03 mục 2③).
2. Hàm tính theo file 07 (đã sửa B1, B2, B3, B6).
3. Giao diện 6 khối + 4 tab phiếu bất thường.
4. AI soạn "Câu hỏi gửi từng kế toán" (dùng lại lớp AI GĐ4) + theo dõi trạng thái (dùng lại GĐ5).
5. Lưu thô 90 ngày + dọn dẹp (Q13).

**Kiểm thử:** tồn kho/công nợ là ảnh chụp hiện trạng nên **không tái tạo được số 03/10** → kiểm bằng cách so số trên dashboard với màn hình CRM cùng thời điểm, 3 ngày khác nhau.

**Điều kiện xong:** 3 ngày liên tiếp khớp CRM; client duyệt. **Demo #4.**

**Ước lượng:** 4–6 phiên.

---

## GĐ7 — Vận hành và chuyển giao

**Mục tiêu:** chạy ổn định không cần ai trông; tắt hẳn cách làm cũ.

**Việc:**
1. Cảnh báo email khi quét sáng lỗi (file 11).
2. Sổ tay vận hành: đổi mật khẩu CRM, CRM đổi giao diện, quét lại, đọc log (file 11).
3. **Tắt các schedule Cowork cũ** (CSKH, công nợ…) sau khi dashboard chạy ổn 7 ngày; gỡ các route `/api/ingest/*` không còn dùng; xóa key ingest.
4. Cập nhật `README.md`, `product-specs/README.md`, `docs/ingestion-schedule.md` (đánh dấu lỗi thời).
5. Theo dõi chi phí (Vercel, Neon, Anthropic) tháng đầu.

**Điều kiện xong:** 7 ngày liên tiếp quét tự động thành công, không ai phải can thiệp; client xác nhận bỏ cách cũ.

**Ước lượng:** 1–2 phiên.

---

## Tổng ước lượng

| Giai đoạn | Phiên |
|---|---|
| GĐ0 | 2–3 |
| GĐ1 | 3–4 |
| GĐ2 | 2–3 |
| GĐ3 | 4–6 |
| GĐ4 | 3–4 |
| GĐ5 | 2–3 |
| GĐ6 | 4–6 |
| GĐ7 | 1–2 |
| **Tổng** | **21–31 phiên** |

Phần lớn rủi ro thời gian nằm ở **GĐ0** (CRM có cung cấp mã/nội dung trong danh sách hay không) và **GĐ4** (chất lượng văn bản AI cần vài vòng chỉnh).

## Việc làm được ngay, không chờ quyết định

1. Thêm `crm-dashboard-spec/` vào `.gitignore` (F1).
2. Đổi `INGEST_API_KEY` (F2).
3. Chạy thử `dry=1` cho cron hiện tại (xác nhận Vercel → CRM thông).
4. Cài Node.js trên máy làm việc.
