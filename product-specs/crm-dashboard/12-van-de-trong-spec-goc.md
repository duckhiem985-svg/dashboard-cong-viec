# 12 — Vấn đề phát hiện trong spec gốc, dữ liệu mẫu và HTML mẫu

> Nguồn đối chiếu: `dashboard_ui_spec.md`, `metrics_source_spec.md`, `dashboard_data.json`, `ref_cskh.html`, `ref_kho.html` (bản 03/10/2026).
> Mỗi mục: **vấn đề → bằng chứng → ảnh hưởng → cách plan xử lý**. Mức độ: 🔴 sai số liệu / chặn tự động hóa · 🟠 sẽ sai khi chạy hằng ngày · 🟡 lệch trình bày / cần chốt.
>
> Mục đích không phải bắt lỗi client: bản tĩnh chạy một lần thì những chỗ này không lộ ra; chỉ khi **tự động chạy mỗi ngày** chúng mới thành lỗi.

## A. Phép kiểm chứng: những gì KHỚP (tăng độ tin cậy cho dữ liệu mẫu)

Đã cộng chéo các số trong `dashboard_data.json`:

| Phép thử | Kết quả |
|---|---|
| Lượt trong kỳ Cẩm + Linh + Trúc = 93 + 65 + 12 | = 170 ✔ |
| Đặt hàng trong kỳ 15 + 22 + 4 | = 41 ✔ |
| Tồn đọng theo 7 nhóm 14+23+37+34+8+3+2 | = 121 ✔ |
| "37 khách treo báo giá, mẫu hoặc vướng giá" = G + Q | 14 + 23 = 37 ✔ |
| Chưa follow-up trong kỳ = số khách có lượt cuối ≥ 23/09 trong danh sách | 30 ✔ (Cẩm 25, Linh 1, Trúc 4 ✔) |
| Mã âm + dương + bằng 0 | 868 + 798 + 524 = 2.190 ✔ |
| Xuất bán theo tháng 2.901,5 + 2.740,6 + 242,3 | = 5.884,4 ✔ |
| Số phiếu 232 + 245 + 23 = 500 đã xuất; + 12 hủy = 512 | khớp ô tóm tắt ✔ |
| Đã thu tiền mặt + CK 842,7 + 5.111,0 | = 5.953,7 ✔ |
| Tổng tuổi nợ 413,4 + 333,4 + 455,4 + 1.708,9 | = 2.911,1 ✔ (khớp spec) |
| Xuất bán theo nhân viên cộng theo tháng | khớp tới 0,1 tr (làm tròn) ✔ |

→ Phần số liệu "cứng" của client **đáng tin**; các vấn đề dưới đây chủ yếu là định nghĩa và cách trình bày.

## B. Sai lệch số liệu

### B1 🔴 Bảng "Công nợ theo người phụ trách" thiếu 5 khách → phép kiểm tra của chính spec sẽ báo lỗi
- **Bằng chứng:** tổng khách 108+160+64+16 = **348**, trong khi bảng chi tiết có **353** khách. Dư nợ cộng theo người = **1.552,4** so với cuối kỳ **1.558,2** (lệch 5,8 tr); phát sinh lệch 54,1 tr; đã thu lệch 48,1 tr.
- **Ảnh hưởng:** spec mục 5.7 yêu cầu "Σ cuối kỳ theo NV = cuối kỳ (sai số < 1 tr), sai thì dừng" → nếu làm đúng spec, **lần quét tự động đầu tiên sẽ thất bại**.
- **Xử lý:** thêm dòng **"Chưa gán người phụ trách"** vào bảng (5 khách có cột 25 rỗng — cần xác minh ở GĐ0). Sau đó phép kiểm mới khớp.

### B2 🔴 "Phát sinh nợ gồm VAT" ≠ sản phẩm + VAT
- **Bằng chứng:** 5.728,8 (sản phẩm) + 337,7 (VAT) = **6.066,5**, nhưng dữ liệu ghi phát sinh nợ tổng **6.116,6** (lệch 50,1 tr). Nhãn trong `doi_soat` ghi "Phát sinh nợ gồm VAT (VAT 337,7)" ngầm hiểu tổng = SP + VAT.
- **Ảnh hưởng:** nhãn gây hiểu sai; phép đối soát "khách lệch" dùng `cn_gom_vat` = cột 9 có thể không phải "gồm VAT" thuần.
- **Xử lý:** GĐ0 phải xác định thành phần còn lại của cột 9 (phí vận chuyển? điều chỉnh?). Đổi nhãn cho đúng.

### B3 🟠 Đầu kỳ + phát sinh − đã thu ≠ cuối kỳ
- **Bằng chứng:** 1.516,3 + 6.116,6 − 5.953,7 = **1.679,2**; cuối kỳ ghi **1.558,2** (lệch 121 tr).
- **Giải thích khả dĩ:** công thức thật còn số dư bên Có (khách trả trước/trả dư) ở đầu kỳ và cuối kỳ. Không hẳn là lỗi, nhưng spec chưa ghi.
- **Xử lý:** GĐ0 đọc đủ cột Đầu kỳ Có / Cuối kỳ Có; thêm phép kiểm phương trình cân đối đầy đủ vào cổng chất lượng.

### B4 🔴 "Số lượt từ 10/08" = 0 cho khách vừa có lượt
- **Bằng chứng:** 20 dòng trong danh sách có `so_luot_tu_10_08 = 0`, dù chính dòng đó có lượt gần nhất trong kỳ mới (ví dụ khách lượt cuối 26/09 mà ghi 0 lượt). HTML mẫu hiển thị 0 thành "Khách mới vào danh sách".
- **Nguyên nhân:** số này chỉ đếm dữ liệu quét trước 22/09, không cộng lượt của kỳ mới.
- **Xử lý:** định nghĩa lại = **số lượt của khách từ mốc tồn đọng đến lúc quét, kể cả lượt gần nhất** (≥ 1 với mọi khách trong danh sách). "Khách mới vào danh sách" tính riêng bằng cờ: khách không có trong danh sách tồn đọng của mốc trước.

### B5 🟠 Văn bản AI ghi số khác dữ liệu
- **Bằng chứng:** câu hỏi kế toán ghi "Tổng các cột tuổi nợ khoảng **2.918** triệu", dữ liệu và spec là **2.911,1**.
- **Ảnh hưởng:** người nhận đối chiếu CRM thấy lệch → mất tin tưởng cả bộ câu hỏi.
- **Xử lý:** bước **tự kiểm số** trong lớp AI (file 08): mọi con số trong văn bản phải truy ra được trong dữ liệu đầu vào (cho phép làm tròn theo quy tắc), sai thì sinh lại/loại câu.

### B6 🟡 Danh sách phiếu hủy chỉ có 6/12 phiếu
- **Bằng chứng:** KPI "12 phiếu, 974 tr", nhưng `phieu_bat_thuong.huy` chỉ liệt kê 6 phiếu (tổng 962,3 tr).
- **Xử lý:** lưu đủ 12; giao diện ghi rõ "6 phiếu lớn nhất / 12" hoặc hiện đủ.

### B7 🟡 Tổng khách theo nhân viên trong kỳ bằng đúng tổng khách cả nhóm
- **Bằng chứng:** 69 + 35 + 9 = 113 = số khách khác nhau toàn kỳ → nghĩa là **không khách nào được 2 người chăm sóc** trong kỳ. Có thể đúng, nhưng cũng có thể do cách đếm.
- **Xử lý:** khi tái tạo số ở GĐ2, kiểm tra riêng; dòng "Cả nhóm" luôn dùng **số khách khác nhau toàn nhóm**, không cộng cột.

### B8 🟡 Tỷ lệ báo giá → đặt hàng lấy kỳ khác các KPI còn lại
- 3 KPI tính kỳ 23/09 → 03/10, KPI thứ 4 tính 10/08 → 22/09 ("chưa tính lại"). Nằm cùng một hàng dễ đọc nhầm là cùng kỳ.
- **Xử lý:** tự động hóa thì tính lại mỗi lần quét; định nghĩa cửa sổ rõ ràng ở file 06 (đề xuất: khách được báo giá trong N ngày gần nhất, N cấu hình).

### B9 🟡 "Lượt chưa bấm hoàn tất" toàn bằng 0 và chỉ tính từ 23/09
- Spec tự ghi "103 lượt Đặt hàng treo trước đó em chưa kiểm tra lại". Chỉ số đang chưa hoàn chỉnh.
- **Xử lý:** quét đầy đủ hằng tuần (file 03 mục 4) bắt được thay đổi trạng thái của lượt cũ; chỉ số tính trên toàn cửa sổ tồn đọng.

## C. Cứng hóa — sẽ sai ngay khi chạy ngày thứ hai

| # | Chỗ cứng | Bằng chứng | Xử lý |
|---|---|---|---|
| C1 🟠 | **Năm 2026** viết chết khi đọc ngày | JS mẫu `parseD`: `new Date(2026, …)`; dữ liệu `luot_gan_nhat: "10/08 17:15"`, `don_gan_nhat: "27/08"` không có năm | Dữ liệu lưu ISO đầy đủ (`2026-08-10T17:15+07:00`); giao diện mới rút gọn `dd/mm` |
| C2 🟠 | Mốc **10/08, 22/09, 23/09** nằm trong nhãn | Tiêu đề cột "Tồn đọng từ 10/08", "Lượt chưa bấm hoàn tất (từ 23/09)", checkbox "Chỉ trong kỳ (từ 23/09)", label KPI "Lượt chăm sóc 23/09 → 03/10" | Mọi nhãn sinh từ `meta` (Q3, Q4) |
| C3 🟠 | **Khóa dữ liệu chứa ngày** | `doi_chieu_22_09`, `so_luot_tu_10_08`, `ton_dong_22_09` | Đổi thành `doi_chieu_moc_truoc`, `so_luot_tu_moc`, `ton_dong_moc_truoc` + trường ngày đi kèm. **Ngoại lệ có chủ đích** so với yêu cầu "giữ nguyên tên khóa" của spec — cần client đồng ý |
| C4 🟠 | **Dải "báo cáo tự động ngưng"** cứng cột 2 → 7 | JS mẫu `OUTAGE_FROM = 2, OUTAGE_TO = 7`; nhãn "18/08 → 22/09" | Tự suy từ lịch sử `ScanRun`: khoảng ngày không có lần quét thành công nào → tô xám, nhãn tự sinh. Giai đoạn trước khi có hệ thống: nhập tay 1 lần |
| C5 🟠 | **Trục biểu đồ tối đa 150** | JS mẫu `max = 150` | Tính theo dữ liệu (làm tròn lên bậc 50) |
| C6 🟠 | **Nhân viên cứng 3 người** | `STAFF` C/L/T; tuần dùng khóa `cam`, `hoang_linh`, `truc` | Danh sách nhân viên từ cấu hình (Q14) + từ dữ liệu; tuần dùng `{ [maNV]: soLuot }`. Trang Kho đã có người thứ 4–6 (Ngọc Hiền, Luyên, Diệp) |
| C7 🟠 | Nhãn "(đến thứ Bảy)" của tuần dở dang | Dữ liệu `chua_tron_tuan: true`, nhãn viết tay | Tự sinh từ ngày quét ("đến thứ Năm"…) |
| C8 🟠 | Banner "Đã chạy lại thành công… qua Claude in Chrome" | Văn bản cứng trong HTML | Sinh từ `ScanRun` (giờ, số lượt mới, cách quét) |
| C9 🟠 | Khối "Cách tính" nhắc tác vụ "cskh-bao-cao-hop-nhat", "mở Claude in Chrome" | Văn bản cứng | Viết lại theo hệ thống mới (nút Quét lại) |
| C10 🟡 | Tên người trong câu hỏi | "chị Hiền", "anh Hòa", "sếp Quốc" | Danh bạ vai trò trong cấu hình cho AI dùng (ai duyệt giá, ai kiểm hệ thống…) — file 08 |

## D. Lệch giữa spec và HTML mẫu (cần client chọn bản nào đúng)

| # | Spec nói | HTML mẫu làm | Đề xuất |
|---|---|---|---|
| D1 🟡 | Banner cũ khi số liệu > **3 ngày** (UI spec 2.1) | Chuyển cảnh báo khi > **1,5 ngày** | Khi quét hằng ngày, đề xuất **> 1 ngày + 2 giờ** (lỡ 1 lần quét là báo). Cấu hình được (Q14) |
| D2 🟡 | Font số **IBM Plex Mono** (UI spec 0) | Trang CSKH không dùng; trang Kho có dùng | Theo Q2 |
| D3 🟡 | Đối chiếu là **thanh ngang 100% chia 3 đoạn** có % (2.8) | Chỉ 3 con số dọc | Làm cả hai: thanh + số (thanh giúp thấy tỷ lệ 91/125 ngay) |
| D4 🟡 | Nút **"Sao chép cả nhóm"** (2.4) | Trang CSKH không có; trang Kho có nút sao chép từng câu | Làm cả hai: sao chép cả nhóm + từng câu |
| D5 🟡 | Cột tuần dở dang **viền nét đứt** (2.6) | Chỉ có nhãn | Làm theo spec |
| D6 🟡 | Màu nhân viên s1/s2/s3 chung mọi biểu đồ | Trang CSKH dùng xanh/cam/lá; trang Kho dùng một màu `--bar` cho thanh | Thống nhất theo Q2 |
| D7 🟡 | Ô "Lượt trong kỳ" tô đỏ nếu < 40% trung bình nhóm (2.5) | Không thấy trong ảnh chụp (Trúc 12 lượt, trung bình ~57 → lẽ ra đỏ) | Làm theo spec, kiểm bằng ảnh chụp |

## E. Thiếu định nghĩa / ca biên chưa tính

| # | Vấn đề | Đề xuất |
|---|---|---|
| E1 🟠 | "Chưa follow-up" xét **≥ 3 ngày tại lúc quét**, nhưng "số ngày treo" tính **lúc mở trang** → khách 2 ngày lúc quét không vào danh sách dù lúc xem đã 3 ngày | Quét mỗi ngày nên độ lệch ≤ 1 ngày; ghi chú trong khối "Cách tính". Không đổi định nghĩa |
| E2 🟡 | `FOLLOW_TYPES` có "Lên lịch hẹn" nhưng dữ liệu không có lượt nào loại này; tên loại lúc viết hoa lúc thường ("Hỏi Hàng"/"Hỏi hàng") | GĐ0 lấy danh sách loại công việc thật của CRM; so khớp không phân biệt hoa thường |
| E3 🟠 | Khách trùng do nhập 2 lần, sai một chữ (dạng "HOA KIỂNG X"/"HOA KIỂN X") — chuẩn hóa tên R7 không gộp được | Ghép theo **mã khách CRM**; ca nghi trùng → gợi ý, chị xác nhận (Q12) |
| E4 🟠 | Tên rút gọn trong dữ liệu Kho (hai dòng dạng "TNHH … (1)" và "(2)") → không phân biệt được 2 khách | Lưu tên đầy đủ + mã KH; rút gọn chỉ ở giao diện |
| E5 🟡 | Danh sách khách chưa follow-up: lượt gần nhất loại `Đặt hàng` → khách bị loại (đúng ý), nhưng lượt `Đặt hàng` **chưa hoàn tất** thì sao? | Đề xuất: vẫn loại; theo dõi riêng ở chỉ số "lượt chưa hoàn tất" |
| E6 🟡 | Chủ nhật công ty nghỉ (spec cũ) nhưng "≥ 3 ngày" đang tính cả Chủ nhật | Cần client chốt: tính ngày lịch hay ngày làm việc. Đề xuất ngày lịch (đơn giản, khớp số hiện tại) |
| E7 🟡 | Chip nhóm có số 0 vẫn bấm được → màn hình trống (thấy rõ trong ảnh: "Việc vận hành còn treo 0" + Hoàng Linh → 0/121) | Làm mờ chip 0 nhưng vẫn cho bấm, hoặc tự gợi ý "Bỏ lọc nhân viên để thấy 8 khách" |
| E8 🟡 | Tài khoản `Administrator` loại khỏi số liệu, nhưng chưa nói các tài khoản đã nghỉ việc | Danh sách tài khoản loại trừ trong cấu hình |
| E9 🟡 | Nhân viên "Khác (Luyên, Diệp, Ngọc Hiền)" gộp ở trang Kho nhưng "Ngọc Hiền" lại có dòng riêng ở bảng công nợ | Quy tắc gộp "Khác" theo từng bảng, cấu hình được |

## F. Dữ liệu và bảo mật

| # | Vấn đề | Xử lý |
|---|---|---|
| F1 🔴 | Thư mục `crm-dashboard-spec/` chứa tên khách, số tiền, ghi chú thật, đang nằm trong repo (chưa commit) | Thêm vào `.gitignore` ngay; fixture kiểm thử dùng dữ liệu **ẩn danh hóa** |
| F2 🟠 | `docs/ingestion-schedule.md` từng hướng dẫn dán key ingest vào prompt; key thật đã xuất hiện trong lịch sử chat | Đổi `INGEST_API_KEY` mới; khi tắt schedule cũ thì gỡ route ingest |
| F3 🟡 | Nội dung ghi chú CRM có thể chứa số điện thoại đầy đủ, giá vốn — sẽ gửi sang API AI (Q6) | Che số điện thoại trước khi gửi; client đồng ý phạm vi dữ liệu gửi đi |

## G. Tổng kết theo mức độ

| Mức | Số mục | Khi nào phải xử lý |
|---|---|---|
| 🔴 | 4 — B1, B2, B4, F1 | Trước/trong GĐ0–GĐ2 |
| 🟠 | 15 — B3, B5, C1–C9, E1, E3, E4, F2 | Trong GĐ1–GĐ3 (dữ liệu, tính số, giao diện) |
| 🟡 | 19 — B6–B9, C10, D1–D7, E2, E5–E9, F3 | Khi làm giao diện; nhiều mục chỉ cần client chọn |
| **Tổng** | **38** | |

Riêng **C3** (đổi tên khóa chứa ngày) đi ngược yêu cầu "giữ nguyên tên khóa JSON" của spec → cần client đồng ý.
