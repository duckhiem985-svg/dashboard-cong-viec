# 13 — Bản demo v2: plan, cải tiến, giả định, bảng đối chiếu

> Bản demo cho client xem trước dashboard **trước khi** có hệ thống quét tự động. Dữ liệu = `dashboard_data.json` (lần quét 03/10/2026), coi như "bản quét hiện hành".

## 1. Mục tiêu

1. Client thấy **đúng nội dung, đúng thứ tự khối** như bản mẫu đã duyệt (không mất thông tin nào).
2. Thấy rõ **cái gì tốt hơn** bản mẫu — và mỗi cải tiến đều có lý do (gắn với vấn đề ở [12](12-van-de-trong-spec-goc.md)).
3. Là bản nháp giao diện để sau này chuyển vào Next.js ở GĐ3 (cùng token, cùng cấu trúc khối).

## 2. Hình thức (tự chốt)

| Quyết định | Chọn | Lý do |
|---|---|---|
| Công nghệ | **1 file HTML độc lập** (HTML + CSS + JS thuần, không thư viện) | Máy chưa có Node để build Next.js; client mở được bằng trình duyệt, gửi được như bản mẫu; dữ liệu thật **không được** deploy lên Vercel/Git ở giai đoạn này |
| Dữ liệu | Nhúng `dashboard_data.json` vào file qua script build PowerShell (`build.ps1`) | Mở file trực tiếp (file://) không cho `fetch` JSON; tách mẫu và dữ liệu để thay dữ liệu chỉ cần chạy lại build |
| Nơi lưu | `crm-dashboard-spec/demo/` (đã `.gitignore`) | Chứa dữ liệu thật |
| Hiển thị | Code **tính từ dữ liệu**, không chép cứng số vào HTML | Đúng tinh thần bản thật: đổi dữ liệu là trang tự đổi |

## 3. Cải tiến so với bản mẫu

### Chung
| # | Cải tiến | Giải quyết |
|---|---|---|
| I1 | **Một trang, 2 tab** "Chăm sóc khách hàng" / "Kho · Xuất bán · Công nợ", nhớ tab qua `#cskh`/`#kho` (bản mẫu là 2 file rời) | Spec mục 1 |
| I2 | **Một hệ giao diện** cho cả 2 tab (token bản CSKH + số dạng mono cho bảng tiền), sáng/tối tự động + nút đổi | D2, D6, Q2-B |
| I3 | **Không ngày nào viết cứng**: nhãn kỳ, mốc, "(đến thứ …)", năm, dải ngưng báo cáo đều suy từ dữ liệu | C1–C9 |
| I4 | **Banner trạng thái theo tuổi dữ liệu** (xanh → cam khi > 26 giờ), ghi rõ "x giờ trước" | D1 |
| I5 | **Khối "Kiểm tra số liệu" tự chạy** khi mở trang: cộng chéo các số (tổng nhóm = tồn đọng, Σ tháng = KPI xuất bán, Σ người phụ trách = cuối kỳ…), hiện ✔/⚠. Có ⚠ thì báo ngay đầu tab | Mục A, B1–B3 của file 12 — tăng độ tin |

### Tab CSKH
| # | Cải tiến | Giải quyết |
|---|---|---|
| I6 | KPI ghi kỳ của chính nó; tỷ lệ báo giá → đặt hàng gắn nhãn "số đến 22/09" | B8 |
| I7 | **Bảng nhân viên bấm được**: bấm ô "Vướng giá" của Trúc → danh sách bên dưới tự lọc Trúc + Vướng giá và cuộn tới | Nối số ↔ chi tiết |
| I8 | Ô "Lượt trong kỳ" tô đỏ khi < 40% trung bình (bản mẫu thiếu) | D7 |
| I9 | Biểu đồ: trục tự co giãn, dải ngưng từ dữ liệu, **cột dở dang viền nét đứt**, bấm chú thích để ẩn/hiện từng người | C4, C5, D5 |
| I10 | Danh sách: chip số 0 làm mờ + gợi ý "bỏ lọc nhân viên để thấy N khách"; tìm kiếm tô vàng chữ khớp; ghi chú dài cắt 2 dòng, bấm mở; nút "Xóa bộ lọc" | E7 |
| I11 | Khách có "0 lượt từ 10/08" hiển thị **"Mới vào danh sách kỳ này"** thay vì số 0 gây hiểu sai | B4 (phần hiển thị) |
| I12 | **Sửa nhóm tay**: trong dòng mở rộng chọn nhóm khác → đếm toàn trang cập nhật, dòng có dấu "đã sửa", lưu trên máy | Spec 1.3 "cho phép sửa tay" |
| I13 | Câu hỏi đốc thúc: **Sao chép cả nhóm** + sao chép từng câu; **trạng thái Chưa gửi / Đã gửi / Đã trả lời** + tiến độ mỗi nhóm | D4, GĐ5 |
| I14 | Đối chiếu: **thanh 100% chia 3 đoạn** có % + số | D3 |

### Tab Kho · Xuất bán · Công nợ
| # | Cải tiến | Giải quyết |
|---|---|---|
| I15 | **Thêm khối "Phiếu bất thường" 4 tab** (bản mẫu thiếu dù spec có) + tự phát hiện "≥ 2 phiếu hủy cùng khách, cùng ngày, cùng tiền" | Spec 3.8 |
| I16 | **Thêm bảng "Khách lệch"** thu gọn, sắp theo lệch giảm dần (bản mẫu chỉ có đoạn chữ) | Spec 3.5 |
| I17 | Bảng công nợ theo người phụ trách: **thêm dòng "Chưa gán (suy ra)"** để tổng khớp cuối kỳ; ô "Trên 30 ngày" đỏ khi > dư nợ; **thanh tuổi nợ** kèm cảnh báo tổng tuổi nợ > dư nợ | B1, spec 3.6 |
| I18 | Dòng đối soát "phát sinh gồm VAT" ghi rõ phần chênh 50,1 tr chưa rõ thành phần | B2 |
| I19 | Câu hỏi kế toán: trạng thái **Chưa gửi / Đã gửi / Đã trả lời / Đạt** + ô ghi chú | Spec 3.7 "nên có" |
| I20 | Tồn lâu nhất hiện đủ 9 mã (bản mẫu 8); danh sách phiếu hủy ghi "6 phiếu lớn nhất / 12" | B6 |

## 4. Giả định tự chốt (để demo chạy được, chưa phải quyết định cuối)

| # | Giả định | Ghi chú |
|---|---|---|
| A1 | Q2 = B: token bản CSKH cho cả 2 tab | Client xem demo rồi chốt |
| A2 | Trạng thái câu hỏi, sửa nhóm, bộ lọc lưu **trên máy người xem** (localStorage) | Bản thật lưu database, nhiều người thấy chung |
| A3 | "Số ngày treo" tính theo giờ mở trang (như bản mẫu), không nhỏ hơn thời điểm quét | — |
| A4 | Ngưỡng "số liệu cũ" = 26 giờ | D1, cấu hình được ở bản thật |
| A5 | Không thêm số liệu mới ngoài phép **suy ra minh bạch** từ dữ liệu có sẵn (dòng "chưa gán", phần chênh VAT), luôn ghi "(suy ra)" | Nguyên tắc 1 của plan |
| A6 | Văn bản soạn sẵn (việc cần giao, câu hỏi) giữ nguyên chữ của dữ liệu; chỗ lệch số được nêu trong khối Kiểm tra số liệu | B5 |
| A7 | Năm của các ngày "dd/mm" suy từ ngày quét (tháng lớn hơn tháng quét → năm trước) | C1 |

## 5. Ngoài phạm vi demo

Quét CRM thật, lớp AI, đăng nhập/phân quyền, chốt kỳ, nhiều người dùng chung trạng thái, bản di động riêng cho nhân viên.

## 6. Cách kiểm tra (double check)

1. **Kiểm tra tự động** bằng trình duyệt chạy ngầm (Edge headless, xuất DOM sau khi chạy JS): đếm số dòng/khối/thẻ so với dữ liệu, mọi ✔ trong khối Kiểm tra số liệu, không lỗi JS.
2. **Chụp màn hình** desktop 1280 px, điện thoại 400 px, chế độ tối → xem bằng mắt.
3. **Đi lại bảng đối chiếu mục 7** từng dòng, ghi Đạt/Lệch.

## 7. Bảng đối chiếu với bản mẫu (đã kiểm 03/10/2026)

Cột "Nguồn": UI = `dashboard_ui_spec.md`, ẢNH = ảnh chụp client gửi, REF = HTML mẫu. Cách kiểm: **A** = kiểm tự động (DOM/kịch bản bấm), **M** = xem ảnh chụp.

| Mã | Yêu cầu | Nguồn | Kết quả |
|---|---|---|---|
| G1 | Tiếng Việt; font chữ Be Vietnam Pro, tiêu đề Barlow Condensed, số tabular | UI 0, REF | ✅ Đạt (M) |
| G2 | Số: chấm nghìn, phẩy thập phân; ngày dd/mm; tiền trang 2 bằng triệu | UI 0 | ✅ Đạt (M): `5.884,4`, `03/10`, "tr" |
| G3 | Màu trạng thái ok/warn/bad tách màu nhấn; màu nhân viên cố định | UI 0 | ✅ Đạt (M): Cẩm xanh dương, Linh cam, Trúc xanh lá ở bảng, biểu đồ, danh sách |
| G4 | Sáng/tối theo hệ thống | UI 0 | ✅ Đạt (M, chế độ tối) + thêm nút đổi tay |
| G5 | Desktop ≤ ~1100 px; điện thoại 1 cột, bảng cuộn trong khung, không cuộn ngang | UI 0 | ✅ Đạt (A: tràn ngang = 0 px ở 360/400/768/1280; M: khung 360 và 400 px) |
| G6 | Mỗi trang có dòng "Quét lúc …" | UI 0 | ✅ Đạt |
| G7 | 2 tab, nhớ theo `#cskh`/`#kho` | UI 1 | ✅ Đạt (A) |
| C1 | Header: dòng nhỏ, H1, meta đủ 4 ý, banner, dòng lần quét trước | UI 2.1, ẢNH | ✅ Đạt (M). Lời banner sinh từ dữ liệu, khác chữ bản mẫu (không còn "Claude in Chrome") |
| C2 | 4 thẻ KPI đúng số, dòng phụ, ngưỡng màu | UI 2.2, ẢNH | ✅ 170 / 30 đỏ / 121 / 37% cam. ⚠ Spec ghi KPI tồn đọng màu `warn`; demo theo **bản mẫu đã duyệt** (số đen, viền nhấn) |
| C3 | Việc cần giao: chip trái, mô tả phải, câu đầu đậm, không đánh số | UI 2.3, ẢNH | ✅ Đạt (M), chữ đậm khớp ảnh 5/5 việc |
| C4 | Câu hỏi đốc thúc: nhóm theo người nhận, đánh số, tên khách đậm, Sao chép cả nhóm | UI 2.4, ẢNH | ✅ Đạt (A: 22 câu, 5 nhóm; M). Thêm trạng thái từng câu + chép từng câu |
| C5 | Bảng nhân viên 11 cột + Cả nhóm, đếm từ danh sách, "a/b · %", đỏ < 40% TB | UI 2.5, ẢNH | ✅ Mọi số khớp ảnh; Trúc 12 lượt tô đỏ (bản mẫu thiếu) |
| C6 | Biểu đồ cột chồng, tổng trên cột, dải ngưng báo cáo, "đến thứ …", bảng ẩn | UI 2.6, ẢNH | ✅ Đạt (A: 142…109; M). Dải ngưng suy từ ghi chú dữ liệu. Không làm "đường phụ số khách" (spec ghi không bắt buộc); số khách có trong tooltip và bảng |
| C7 | Danh sách 121 khách đủ bộ lọc, nhóm có tiêu đề + gợi ý, màu số ngày 4 mức, lưu bộ lọc | UI 2.7, ẢNH | ✅ Đạt (A: lọc, tìm không dấu, lưu qua tải lại) |
| C8 | Đối chiếu 2 / 32 / 91, nhóm ưu tiên, thanh 3 đoạn | UI 2.8, ẢNH | ✅ Đạt. ⚠ Đoạn "Đã có động thái: 2 khách đã đặt đơn…" trong ảnh **không có trong dữ liệu JSON** nên demo không hiện |
| C9 | Khối "Cách tính" thu gọn được | UI 2.9, ẢNH | ✅ Đạt. Mặc định **đóng** theo spec (ảnh client đang mở). Nội dung viết chung, vì các con số riêng như "691 lượt" không có trong dữ liệu |
| K1 | Header + kỳ + đơn vị | UI 3.1, REF | ✅ Đạt |
| K2 | 6 KPI, số mono, màu theo state | UI 3.2, REF | ✅ Đạt |
| K3 | Bảng tồn theo nhóm (mã âm đỏ > 50%), thanh tồn lâu, hộp ghi chú | UI 3.3, REF | ✅ Đạt + lọc nguyên liệu/thành phẩm (A) + dòng "nhóm không liệt kê (suy ra)" + đủ 9 mã tồn lâu |
| K4 | Thanh xuất bán theo tháng, bảng NV T8/T9/T10 | UI 3.4, REF | ✅ Đạt + dòng Cộng |
| K5 | Bảng đối soát có pill; bảng khách lệch thu gọn | UI 3.5 | ✅ Đạt (bản mẫu chỉ có đoạn chữ, demo có bảng 14 khách) |
| K6 | Công nợ theo NV + pill; "Trên 30 ngày" đỏ; khách nợ lớn; thanh tuổi nợ | UI 3.6, REF | ✅ Đạt + dòng "Chưa gán (suy ra)" + dòng tổng. Sửa 100% → 101% (bản mẫu đúng) |
| K7 | Câu hỏi kế toán: thẻ 4 phần, Sao chép, trạng thái + ghi chú | UI 3.7, REF | ✅ Đạt (A: Đạt 1 câu) + cảnh báo ngay trên thẻ có số sai |
| K8 | Phiếu bất thường 4 tab | UI 3.8 | ✅ Đạt (A) — **bản mẫu thiếu khối này** |
| K9 | Dòng giới hạn cuối trang | UI 3.9, REF | ✅ Đạt |
| N1 | Gợi ý hành động 7 nhóm đúng chữ | UI 4.1 | ✅ Đạt |

### Điểm khác bản mẫu có chủ đích

1. **Màu trang Kho** theo hệ của trang CSKH (giả định A1, chờ Q2). Bản mẫu Kho dùng xanh navy.
2. Văn bản tự sinh (banner, câu nhận xét dưới biểu đồ) **khác chữ** bản mẫu, vì bản mẫu viết tay và có chi tiết không nằm trong dữ liệu.
3. KPI tồn đọng: theo bản mẫu (viền nhấn), không theo chữ spec (`warn`).

### Cải tiến phát sinh khi kiểm (ngoài danh sách I1–I20)

| # | Cải tiến | Lý do |
|---|---|---|
| I21 | Dòng "Các nhóm không liệt kê (suy ra)": 767 mã, 528 mã âm, trị giá ròng −505 tr | Bảng nhóm của bản mẫu chỉ có 1.423/2.190 mã; phần bị ẩn lại là nơi tập trung mã âm |
| I22 | Khi lọc ra 0 khách: gợi ý **từng bộ lọc nên bỏ** kèm số khách sẽ thấy (tối đa 2 gợi ý) | Ảnh client có ca 0/121 do chồng bộ lọc |
| I23 | Câu hỏi kế toán có số lệch dữ liệu → cảnh báo ngay trên thẻ | B5: tránh gửi số sai (2.918 so với 2.911,1) |
| I24 | Câu nhận xét dưới biểu đồ tự sinh (tuần thấp nhất, người nhiều nhất/ít nhất tuần gần nhất) | Bản mẫu là chữ viết tay, sẽ cũ ngay hôm sau |
| I25 | Nhãn tab ngắn trên điện thoại ("CSKH", "Kho · Công nợ") | Tab dài bị cắt ở 360 px |
| I26 | **Chọn khoảng ngày** (lịch Từ ngày / Đến ngày + 5 mốc nhanh: 7 ngày, 30 ngày, kỳ quét, từ mốc tồn đọng, toàn bộ) | Client yêu cầu 03/10. Xem mục 8 |
| I27 | **Thu gọn / mở từng mục** từ "Việc cần giao ngay" trở xuống (CSKH 7 mục, Kho 6 mục) | Client yêu cầu 03/10. Xem mục 9 |

## 8. Tính năng chọn khoảng ngày (thêm 03/10)

**Giới hạn của dữ liệu demo:** `dashboard_data.json` chỉ có số đã tính sẵn cho các kỳ cố định, không có từng lượt chăm sóc kèm ngày. Vì vậy khoảng ngày **chỉ áp được cho 2 khối có ngày**:

| Khối | Theo khoảng ngày? | Cách lọc |
|---|---|---|
| Nhịp chăm sóc theo tuần (biểu đồ + bảng) | ✅ | Hiện các tuần giao với khoảng chọn. Tuần chỉ giao một phần có dấu `*` và vẫn hiện đủ số cả tuần, vì dữ liệu chỉ có tổng tuần |
| Khách chưa follow-up | ✅ | Lọc theo **ngày lượt gần nhất** |
| 4 KPI, việc cần giao, câu hỏi, bảng nhân viên, đối chiếu | ❌ | Có nhãn "Số của kỳ quét 23/09 → 03/10" khi đang chọn khoảng |

**Quy tắc:**
- Ngày của từng tuần suy từ ngày quét (03/10 là thứ Bảy, nên tuần cuối bắt đầu thứ Hai 28/09). Có phép tự kiểm khớp nhãn của 9 tuần.
- Chọn ngược thì tự đổi chỗ. Chọn ngoài phạm vi dữ liệu (03/08 → 03/10) thì kẹp vào phạm vi.
- Khoảng ngày được lưu lại khi tải lại trang.
- Bấm số ở bảng nhân viên (số của kỳ) sẽ tự bỏ khoảng ngày, để danh sách khớp đúng con số vừa bấm.
- Lọc ra 0 khách thì gợi ý có thêm "bỏ khoảng ngày".

**Kiểm thử:** kịch bản riêng **26/26 đạt**, với số kỳ vọng tính độc lập từ dữ liệu gốc (ví dụ kỳ quét → 30 khách = KPI; 01/09 → 15/09 → 41 khách, 3 tuần). Kịch bản cũ chạy lại vẫn 24/24, không ảnh hưởng tính năng trước.

**Ở bản chính thức** (có từng lượt trong database), khoảng ngày sẽ áp cho **mọi khối**. Gắn với quyết định Q3 trong [01-quyet-dinh.md](01-quyet-dinh.md).

### Kết quả kiểm tra tự động

- **Kiểm tra số liệu trong trang:** 20 mục. 13 khớp, 4 lệch (đúng các vấn đề B1, B2, B3, B5 ở file 12), 3 mục thông tin. Không có báo sai.
- **Kịch bản bấm thử** (Edge chạy ngầm): **24/24 bước đạt**. Gồm lọc từ bảng nhân viên, chip, tìm không dấu, sửa nhóm (bảng nhân viên tự cập nhật), đánh dấu câu hỏi, tải lại vẫn giữ trạng thái, ẩn nhân viên trên biểu đồ, chuyển tab, tab phiếu bất thường, lọc loại kho, trạng thái câu hỏi kế toán, đổi giao diện.
- **Không lỗi JavaScript; tràn ngang 0 px** ở 360 / 400 / 768 / 1280 px.

### Lưu ý khi mở demo

- Banner tính tuổi dữ liệu theo **giờ mở trang**. Mở sau 16:00 ngày 04/10/2026, banner tự chuyển sang **cam "Số liệu đã cũ"**. Đây là hành vi đúng, không phải lỗi.
- Trạng thái câu hỏi, nhóm đã sửa và bộ lọc lưu trên **trình duyệt của người mở**, người khác không thấy.

## 9. Thu gọn / mở từng mục (thêm 03/10)

- **Nút ▾ ở tiêu đề mỗi mục**: bấm để thu gọn. Mục thu gọn chỉ còn tiêu đề và **1 dòng tóm tắt số chính** (ví dụ "22 câu hỏi cho 5 người · đã gửi 0/22"), nên vẫn nắm được tình hình mà không phải cuộn.
- **Thanh "Các mục"** ngay trên "Việc cần giao ngay": mỗi mục một nút, bấm để ẩn hoặc hiện. Bấm hiện thì trang tự chuyển tới mục đó. Có thêm nút "Mở tất cả" và "Thu gọn tất cả". Trên điện thoại, hàng nút cuộn ngang.
- Không thu gọn: đầu trang, 4 chỉ số (luôn phải thấy) và "Cách tính" (vốn đã tự đóng mở được).
- Trạng thái nhớ theo từng trang khi tải lại. Mặc định mở hết.
- Ca biên đã xử lý:
  - Bấm số ở bảng nhân viên khi danh sách khách đang thu gọn thì danh sách tự mở.
  - Mở lại biểu đồ thì biểu đồ vẽ lại đúng bề rộng.
  - Dòng tóm tắt đổi theo khoảng ngày và bộ lọc đang chọn.
  - Ctrl+F vẫn tìm thấy chữ trong mục đang thu gọn và tự mở mục đó (Chrome/Edge).
  - Khi in, mọi mục đều in ra đầy đủ.
- Kiểm thử: 38/38 bước tự động đạt. Hai bộ kiểm thử cũ vẫn đạt: khoảng ngày 26/26, tương tác 24/24. Không tràn ngang. Ảnh chụp desktop và điện thoại 380 px đã xem.
