# 03 — Kiến trúc hệ thống và luồng dữ liệu

> Giải thích cho người mới: "kiến trúc" ở đây là **hệ thống gồm những khối nào, mỗi khối làm gì, dữ liệu chạy qua chúng theo thứ tự nào, và khi một khối hỏng thì chuyện gì xảy ra**.

## 1. Bức tranh tổng

```
                     ┌──────────────────────── Vercel (luôn bật) ────────────────────────┐
                     │                                                                   │
 ┌──────────────┐    │  ① Bộ hẹn giờ (Cron 05:00)    ⑨ Nút "Quét lại" (ADMIN)            │
 │ CRM incomSoft│    │            │                          │                           │
 │ (SugarCRM)   │◄───┼── ② Bộ quét CRM: đăng nhập → đọc từng module → lưu bản ghi thô ──┐ │
 │ Tasks        │    │                                                                  │ │
 │ Stocks       │    │  ③ Bộ kiểm tra: đủ trang? khớp tổng? cột đúng chỗ? ──── sai ──► dừng, giữ bản cũ
 │ Warehouse_Out│    │            │ đúng                                               │ │
 │ Debit_Bills  │    │  ④ Bộ tính số: hàm thuần, ra đúng cấu trúc dashboard_data.json   │ │
 └──────────────┘    │            │                                                     │ │
                     │  ⑤ Lớp AI (Claude API): phân nhóm khách + soạn việc/câu hỏi      │ │
 ┌──────────────┐    │            │  (AI lỗi → vẫn công bố số, khối chữ dùng bản cũ)    │ │
 │ Anthropic API│◄───┼────────────┘                                                     │ │
 └──────────────┘    │  ⑥ Công bố: lưu "bản dashboard" mới, đánh dấu là bản hiện hành   │ │
                     │            │                                                     │ │
 ┌──────────────┐    │  ⑦ Trang web (Next.js): đọc bản hiện hành + lớp sửa tay của chị  │ │
 │ Neon Postgres│◄───┼──── mọi khối đọc/ghi ở đây ────────────────────────────────────┘ │
 └──────────────┘    │  ⑧ Cảnh báo: email khi lần quét sáng thất bại                     │
                     └───────────────────────────────────────────────────────────────────┘
```

## 2. Từng khối

### ① Bộ hẹn giờ
- Vercel Cron gọi `GET /api/cron/scan` lúc **05:00 giờ VN** (`0 22 * * *` UTC, lệch tối đa 59 phút trên gói Hobby).
- Chỉ làm một việc: tạo một **lần quét** (`ScanRun`) và kích bước đầu tiên. Không tự làm việc nặng.

### ② Bộ quét CRM
Mở rộng từ `src/lib/crm.ts` hiện có (đã chứng minh đăng nhập + đọc `Customer_Cares` bằng HTTP thuần chạy được trên Vercel).

Tách thành 3 lớp:

| Lớp | Trách nhiệm | File dự kiến |
|---|---|---|
| **Phiên CRM** | Đăng nhập, giữ cookie, phát hiện bị đá ra trang login, tự đăng nhập lại 1 lần, giãn cách request (lịch sự với server CRM), giới hạn thời gian mỗi request | `src/lib/crm/session.ts` |
| **Đọc bảng** | Nhận HTML → tìm bảng chính (bảng nhiều dòng nhất, spec R3) → tách dòng/ô → chuẩn hóa số (`1,234,567`, `-`, rỗng → 0, spec R4) → **kiểm tra tiêu đề cột đúng như mong đợi** trước khi đọc | `src/lib/crm/table.ts` |
| **Từng module** | Biết URL, tham số lọc, cách phân trang, chỉ số cột của module đó; trả về bản ghi có cấu trúc | `src/lib/crm/tasks.ts`, `stocks.ts`, `warehouse-outs.ts`, `debts.ts` |

Quy tắc lịch sự với CRM: request **tuần tự** (không bắn song song), nghỉ ~300 ms giữa các trang, tối đa ~1 lần quét đầy đủ/giờ, header nhận diện `User-Agent: dashboard-cong-viec/1.0`.

### ③ Bộ kiểm tra (cổng chất lượng)
Chạy **sau khi quét xong, trước khi tính**. Bất kỳ điều kiện nào sai → lần quét đánh dấu `failed`, **không công bố**, ghi lý do. Danh sách điều kiện lấy từ spec gốc mục 5.7 và bổ sung:

| Kiểm tra | Áp dụng |
|---|---|
| Số dòng đọc được = số trên nhãn phân trang ("1 - 100 của **N**") | Mọi module có phân trang |
| Tiêu đề cột khớp danh sách mong đợi (phát hiện CRM thêm/bớt cột) | Mọi bảng |
| Số phiếu xuất đọc được = ô "Tổng cộng" của tóm tắt trạng thái | Xuất kho |
| Σ xuất theo tháng = KPI xuất bán | Kho |
| Σ cuối kỳ theo nhân viên ≈ tổng cuối kỳ (sai < 1 triệu) | Công nợ |
| Không có ngày bất hợp lệ, không có mã trùng sau khử trùng | Mọi module |
| Biến động bất thường so với lần quét trước (ví dụ tồn kho giảm 90% qua 1 đêm) | Cảnh báo mềm: vẫn công bố nhưng gắn cờ |

### ④ Bộ tính số
- Gồm các **hàm thuần** (cùng đầu vào luôn cho cùng kết quả, không đọc mạng/DB bên trong) → dễ kiểm thử.
- Đầu vào: bản ghi thô của lần quét + cấu hình (kỳ, mốc, tham số Q14) + dữ liệu lần trước (cho đối chiếu).
- Đầu ra: object có **đúng tên khóa như `dashboard_data.json`** (spec yêu cầu giữ tên khóa), kèm `schemaVersion`.
- Công thức chi tiết: file 06 (CSKH) và 07 (Kho).

### ⑤ Lớp AI
- Hai việc: (a) **phân nhóm** G/Q/N/P/O/L/K cho từng khách tồn đọng; (b) **soạn văn bản**: việc cần giao, câu hỏi đốc thúc, câu hỏi kế toán, đoạn diễn giải biểu đồ, nhóm ưu tiên.
- **Bộ nhớ đệm:** chỉ gửi AI những khách có ghi chú **mới hoặc thay đổi** (so theo mã băm nội dung). Khách không đổi giữ nhóm cũ → tiết kiệm chi phí, nhóm không "nhảy" ngẫu nhiên giữa các ngày.
- **Chị sửa tay thắng AI:** nhóm do chị sửa được giữ cho tới khi khách có lượt mới.
- **Tự kiểm số:** mọi con số xuất hiện trong văn bản AI được đối chiếu với số liệu đầu vào; câu có số không khớp bị loại/sinh lại.
- Chi tiết prompt, model, chi phí: file 08.

### ⑥ Công bố
- Lưu kết quả thành một **bản dashboard** (`DashboardSnapshot`: loại trang, lần quét, dữ liệu JSON, thời điểm).
- Đánh dấu "hiện hành" trong cùng một giao dịch DB → người xem không bao giờ thấy nửa cũ nửa mới.
- Cập nhật `SyncStatus` (đang dùng cho huy hiệu "Cập nhật lúc…" ở các trang cũ).

### ⑦ Trang web
- Trang là **Server Component** của Next.js: đọc bản hiện hành bằng 1 truy vấn, ghép thêm **lớp sống**: trạng thái câu hỏi, nhóm do chị sửa, mốc kỳ.
- Phần tính ngay trên trang (spec cho phép): số ngày treo (tính theo giờ mở trang), đếm theo nhóm/nhân viên, tỷ lệ, bộ lọc.
- Bộ lọc danh sách khách chạy phía trình duyệt (121 dòng, nhẹ) để bấm là thấy ngay, giữ `localStorage` như bản mẫu.
- Thao tác ghi (sửa nhóm, đánh dấu câu hỏi, chốt kỳ, quét lại) dùng **Server Actions** có kiểm quyền ADMIN.

### ⑧ Cảnh báo
- Lần quét theo lịch thất bại → gửi email cho chủ dự án (qua Gmail connector hoặc dịch vụ email; chốt ở file 11) + banner đỏ trên trang.
- Không gửi email khi lần "Quét lại" bấm tay thất bại (người bấm đã thấy ngay trên màn hình).

## 3. Chia lần quét thành nhiều bước (vì giới hạn 300 giây)

Gói Hobby cắt mỗi lần chạy ở **300 giây**. Một lần quét đầy đủ (công việc CSKH + ~22 trang tồn kho + xuất kho + công nợ + AI) có thể vượt mức đó. Giải pháp: **chuỗi bước nối tiếp**, mỗi bước là một lần gọi riêng, lưu tiến độ vào DB.

```
/api/cron/scan            tạo ScanRun(status=running, stage=1) → gọi bước 1
/api/scan/step?run=X       đọc ScanRun.stage → làm bước đó → lưu kết quả + tiến độ
                           → nếu còn bước: tự gọi /api/scan/step cho bước kế (không chờ phản hồi)
                           → nếu hết bước: đánh dấu done
```

| Bước | Việc | Ước lượng (cần đo ở GĐ0) |
|---|---|---|
| 1 | Đăng nhập + kiểm tra CRM sống + đọc công việc CSKH mới (từ lần quét thành công gần nhất − 3 ngày, spec mục 5) | 10–60 s |
| 2 | Đọc chi tiết công việc nếu danh sách thiếu nội dung (theo lô, có điểm dừng) | 0–250 s, có thể nhiều lượt |
| 3 | Tồn kho: ~22 trang × 100 dòng | 30–120 s |
| 4 | Xuất kho (01/08 → cuối tháng hiện tại) | 10–60 s |
| 5 | Công nợ: khối tổng hợp + bảng chi tiết | 10–40 s |
| 6 | Kiểm tra cổng chất lượng + tính số cả 2 trang | < 5 s |
| 7 | AI: phân nhóm khách thay đổi + soạn văn bản | 20–90 s |
| 8 | Công bố + dọn dữ liệu thô quá hạn | < 5 s |

**Nguyên tắc cho chuỗi bước:**
- **Tiếp tục được (resumable):** bước dài lưu "đã đọc tới trang/lô nào". Nếu bị cắt ở giây 300, lần gọi kế tiếp đọc tiếp từ đó, không làm lại từ đầu.
- **Làm lại không sinh trùng (idempotent):** ghi dữ liệu bằng "cập nhật nếu có, thêm nếu chưa" theo **mã nguồn CRM** (mã công việc, mã phiếu, mã khách).
- **Khóa một lần quét:** đang có lần quét `running` thì không cho bắt đầu lần mới (trừ khi lần đó treo quá 30 phút → coi là chết, cho phép chạy lại).
- **Đồng hồ an toàn:** mỗi bước tự dừng ở ~270 giây, lưu tiến độ, tự gọi lại chính nó.
- **Chống gọi giả:** route `/api/scan/step` đòi header bí mật (`CRON_SECRET`), giống cron hiện tại.

**Phương án thay thế cần đánh giá ở GĐ0:** Vercel Workflows (cho phép chạy dài, tự lưu trạng thái giữa các bước). Nếu dùng được trên gói hiện tại thì thay cơ chế tự gọi ở trên, code gọn hơn. Chưa chọn vì chưa kiểm tra giá/giới hạn trên Hobby.

## 4. Quét "mới" và quét "toàn bộ"

| Loại | Khi nào | Phạm vi |
|---|---|---|
| **Quét gia tăng** (hằng ngày) | 05:00 mỗi ngày, nút Quét lại | Công việc CSKH có ngày bắt đầu từ (lần thành công trước − 3 ngày) tới nay; tồn kho/xuất kho/công nợ luôn đọc toàn bộ (vì là ảnh chụp hiện trạng) |
| **Quét đầy đủ CSKH** | Chủ nhật hằng tuần + lần chạy đầu tiên | Toàn bộ công việc từ mốc tồn đọng (Q4) tới nay — bắt các sửa đổi trên công việc cũ (đổi trạng thái "Hoàn tất", sửa nội dung) mà quét gia tăng bỏ sót |
| **Nạp lịch sử** (một lần) | Khi khởi tạo | Từ 01/08/2026 → nay, để có ngay biểu đồ 9 tuần và tái tạo số 03/10 làm phép thử |

## 5. Luồng dữ liệu của một ngày (ví dụ cụ thể)

```
04/10 05:12  Cron gọi /api/cron/scan → ScanRun #57 (running)
05:12:03     Bước 1: đăng nhập OK; đọc Tasks 01/10 → 04/10: 41 công việc (38 đã có, 3 mới, 2 đổi trạng thái)
05:12:40     Bước 3: tồn kho 22 trang, 2.193 dòng; nhãn CRM "của 2193" ✔
05:14:05     Bước 4: xuất kho 515 phiếu; ô Tổng cộng 515 ✔
05:14:30     Bước 5: công nợ 354 khách, tổng hợp đọc được ✔
05:14:31     Bước 6: tất cả kiểm tra đạt; tính số: 118 khách tồn đọng, 27 chưa follow-up trong kỳ…
05:14:32     Bước 7: AI phân nhóm 9 khách có ghi chú mới (112 khách giữ nhóm cũ); soạn 5 việc + 21 câu hỏi; kiểm số ✔
05:15:20     Bước 8: công bố DashboardSnapshot #57 (cskh) và #58 (kho); SyncStatus cập nhật
07:30        Chị mở trang → thấy "Đã quét lúc 05:15 hôm nay"
```

## 6. Ma trận lỗi

| Lỗi | Phát hiện ở | Hệ quả với người xem | Tự phục hồi |
|---|---|---|---|
| Sai mật khẩu CRM | Bước 1 (vẫn thấy form login sau POST) | Banner đỏ, giữ bản cũ | Không — cần sửa env |
| CRM sập/chậm | Bước 1–5 (timeout) | Như trên | Thử lại 2 lần, cách 30 s; sau đó dừng |
| CRM đổi cột | Bước 3–5 (kiểm tra tiêu đề) | Như trên, ghi rõ module + cột | Không — cần sửa code |
| Thiếu trang (đọc < tổng) | Bước 6 | Như trên | Thử lại module đó 1 lần |
| Bị cắt ở 300 s | Đồng hồ an toàn | Không thấy gì (đang chạy) | Có — tự gọi tiếp |
| AI lỗi / hết hạn mức | Bước 7 | Số liệu mới bình thường; khối chữ hiện bản trước + nhãn "chưa cập nhật" | Không — kiểm tra API key |
| DB lỗi khi công bố | Bước 8 | Giữ bản cũ (giao dịch hủy toàn bộ) | Thử lại 1 lần |
| Cron không chạy | Banner theo ngưỡng "số liệu cũ" | Banner cam | Không — bấm Quét lại |

## 7. Bảo mật

| Bí mật | Nơi lưu | Ai đặt |
|---|---|---|
| `CRM_USERNAME`, `CRM_PASSWORD` | Biến môi trường Vercel | Client/chủ dự án tự nhập |
| `CRON_SECRET` | Biến môi trường Vercel | Chủ dự án |
| `ANTHROPIC_API_KEY` (nếu Q6-A) | Biến môi trường Vercel | Client/chủ dự án tự nhập |
| `INGEST_API_KEY` (cũ) | Biến môi trường Vercel | Nên **đổi mới** vì từng bị dán trong chat; xóa hẳn khi tắt các route ingest cũ |

- Log chỉ ghi số đếm và mã lỗi, **không ghi** tên khách, ghi chú, số tiền chi tiết.
- Trang dashboard đã nằm sau đăng nhập (`src/proxy.ts`); route API quét/bước dùng bí mật riêng; Server Actions ghi dữ liệu kiểm vai trò ADMIN.
- Thư mục `crm-dashboard-spec/` (dữ liệu thật) thêm vào `.gitignore`.

## 8. Những gì tái sử dụng từ code hiện có

| Có sẵn | Dùng lại thế nào |
|---|---|
| `src/lib/crm.ts` (đăng nhập, gọi CRM, bóc chữ HTML) | Tách thành lớp Phiên + Đọc bảng; bỏ phần riêng của `Customer_Cares` vào module đối chiếu |
| `/api/cron/care` | Thành bước phụ "đối chiếu số CS khách hàng của CRM" (Q1-B) hoặc gỡ |
| `SyncStatus` + `SyncBadge` | Giữ cho các trang cũ; trang mới dùng `ScanRun` chi tiết hơn |
| `auth.ts`, vai trò `Role` | Dùng nguyên cho phân quyền Q10 |
| `foldText` trong `src/lib/care.ts` | Dùng cho chuẩn hóa tên khách (spec R7) và tìm kiếm không dấu |
| Các route `/api/ingest/*` | Giữ tới khi tắt hẳn các schedule Cowork cũ, rồi gỡ |
