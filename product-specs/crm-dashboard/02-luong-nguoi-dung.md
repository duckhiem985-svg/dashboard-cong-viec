# 02 — Luồng người dùng

> Mô tả **ai** dùng, **lúc nào**, **từng bước bấm gì, thấy gì, quyết định gì**. Viết theo đề xuất trong [01-quyet-dinh.md](01-quyet-dinh.md); chỗ nào phụ thuộc quyết định chưa chốt có ghi mã Q.

## 1. Vai trò

| Vai trò | Người | Câu hỏi họ mang tới trang | Tần suất |
|---|---|---|---|
| Giám đốc (ADMIN) | Chị Hiền | "Ai đang bỏ sót khách? Hôm nay giao gì, hỏi ai? Kho và công nợ có chỗ nào sai?" | Mỗi sáng + khi họp |
| Nhân viên kinh doanh (SALES) | Cẩm, Hoàng Linh, Trúc | "Chị hỏi em những khách nào? Em còn treo khách nào?" | Mỗi ngày (nếu Q10 bật) |
| Kế toán (KETOAN) | Kế toán bán hàng, công nợ | "Chị cần em giải trình phiếu/khoản nào, hạn khi nào?" | Khi có câu hỏi mới |
| Kho (KHO) | Thủ kho, kế toán kho | "Mã tồn âm/tồn lâu nào cần kiểm?" | Khi có câu hỏi mới |
| Vận hành | Chủ dự án | "Lần quét hôm nay có chạy không? Lỗi ở đâu?" | Khi có cảnh báo |

## 2. Luồng chính — Buổi sáng của giám đốc (trang CSKH)

```
05:00  Hệ thống tự quét CRM → tính số → AI soạn văn bản → công bố bản mới
07:30  Chị mở dashboard
```

| Bước | Chị làm | Chị thấy | Chị quyết định |
|---|---|---|---|
| 1 | Đăng nhập, vào **CSKH** (mặc định chế độ "Quản trị") | **Banner trạng thái**: xanh "Đã quét lúc 05:07 hôm nay" / cam "Số liệu cũ 2 ngày" / đỏ "Lần quét sáng nay lỗi, đang hiện bản 05:04 hôm qua" | Có tin số liệu hôm nay không |
| 2 | Lướt dòng meta + **4 thẻ KPI** | Lượt trong kỳ, khách chưa follow-up trong kỳ (đỏ nếu > 20), tồn đọng, tỷ lệ báo giá → đặt hàng | Tình hình chung tốt hay xấu đi |
| 3 | Đọc **Việc cần giao ngay** | 4–6 việc, mỗi việc có người nhận, mô tả, hạn | Giao việc nào trong buổi họp |
| 4 | Mở **Câu hỏi đốc thúc**, nhóm của Trúc | Danh sách câu hỏi có tên khách đậm, ngày CRM, số ngày treo, "Chị cần: …" | Hỏi Trúc những gì |
| 5 | Bấm **"Sao chép cả nhóm"** | Toast "Đã chép 6 câu hỏi cho Trúc" | — |
| 6 | Dán vào Zalo gửi Trúc (ngoài hệ thống) | — | — |
| 7 | Quay lại, bấm **"Đánh dấu đã gửi"** cho nhóm Trúc *(Q11)* | Các câu chuyển trạng thái "Đã gửi 07:42" | — |
| 8 | Xem **bảng Theo nhân viên** | Trúc 12 lượt — ô đỏ vì < 40% trung bình | Cần nói chuyện riêng với Trúc |
| 9 | Xem **biểu đồ tuần** | Nhịp từng người theo tuần; dải xám đánh dấu giai đoạn không có báo cáo tự động | Xu hướng đang lên hay xuống |
| 10 | Vào **Khách chưa follow-up**, lọc "Vướng giá" | 14 khách, sắp theo số ngày treo | Quyết giá cho ca nào |
| 11 | Bấm mở rộng ghi chú 1 khách | Toàn văn ghi chú CRM, loại lượt, đơn gần nhất | — |
| 12 | *(tùy chọn)* Sửa nhóm của 1 khách AI xếp sai | Khách chuyển nhóm, có dấu "chị đã sửa" | — |
| 13 | Xem **Đối chiếu với mốc trước** | 2 đã đặt / 32 chăm sóc lại / 91 chưa ai liên hệ | Lần nhắc trước có hiệu quả không |

**Thời gian mục tiêu:** bước 1–7 (nắm tình hình + gửi câu hỏi) **dưới 5 phút**.

## 3. Luồng phụ — Trong ngày

### 3a. Chị muốn số mới ngay (sau khi nhân viên nhập liệu buổi chiều)
1. Bấm **"Quét lại ngay"** (chỉ ADMIN thấy).
2. Nút chuyển "Đang quét… bước 2/5: đọc công việc CSKH". Trang vẫn dùng được với bản cũ.
3. Xong (vài phút): banner đổi giờ quét; khối nào thay đổi số có dấu chấm "mới".
4. Nếu lỗi: banner đỏ nói rõ bước nào lỗi, bản cũ vẫn giữ. Không có số nửa vời.
5. Giới hạn: không cho bấm khi đang có lần quét chạy; tối đa N lần/ngày (chống quá tải CRM).

### 3b. Nhân viên trả lời câu hỏi qua Zalo
1. Chị mở câu hỏi tương ứng → bấm **"Đã trả lời"** → dán/ghi tóm tắt câu trả lời.
2. Nếu câu trả lời khớp tiêu chí "Trả lời đạt là…" (trang Kho) → bấm **"Đạt"**; nếu không → giữ "Đã trả lời", có thể ghi "hỏi tiếp".
3. Sáng hôm sau, nếu tình huống trên CRM đã đổi (khách đã có lượt mới), câu hỏi cũ tự chuyển "Có thể đã xử lý — kiểm tra lại" thay vì bị AI hỏi lặp lại.

### 3c. Chốt kỳ sau buổi họp (Q3-C)
1. Bấm **"Chốt kỳ"** → hộp xác nhận: "Chốt kỳ 23/09 → 06/10. Kỳ mới bắt đầu từ bây giờ. Danh sách tồn đọng hiện tại (121 khách) sẽ là mốc để đối chiếu lần sau."
2. Xác nhận → lưu mốc. KPI "trong kỳ" về 0 và đếm lại từ đây; khối Đối chiếu dùng mốc vừa chốt.
3. Có thể xem lại kỳ cũ qua bộ chọn kỳ.

### 3d. Xem báo cáo một ngày (chế độ "Theo ngày", Q1-B)
1. Chuyển tab **"Theo ngày"** → mặc định **hôm qua** theo giờ VN.
2. Thấy: số khách được chăm sóc, danh sách khách, ai chăm sóc, giờ, nội dung từng lượt (giữ đúng luồng của `product-specs/cskh/01-user-flow.md`).
3. Chủ nhật 0 lượt → "Chủ nhật công ty nghỉ", không cảnh báo. Ngày thường 0 lượt → cảnh báo cần kiểm tra.

## 4. Luồng nhân viên (nếu Q10 bật)

1. Đăng nhập bằng tài khoản của mình → vào CSKH chỉ thấy **"Việc của tôi"**:
   - Câu hỏi chị gửi mình (trạng thái, hạn).
   - Danh sách khách mình đang treo, sắp theo số ngày.
2. Không thấy số của người khác, không thấy công nợ/kho.
3. Nhân viên **không trả lời trên dashboard** ở V1 (vẫn trả lời qua Zalo) — tránh tạo thêm kênh. Có thể mở ở V2.

## 5. Luồng trang Kho · Xuất bán · Công nợ (V2 theo Q11-A)

### 5a. Giám đốc
1. Vào trang → banner trạng thái + dòng "Lấy từ incomSoft lúc … · Kỳ 01/08 → hôm nay · Đơn vị: triệu đồng".
2. **6 thẻ KPI**: tồn kho, mã âm (đỏ), xuất bán, phiếu hủy (đỏ), công nợ cuối kỳ, nợ quá hạn.
3. Lướt 5 khối: kho theo nhóm → xuất bán theo tháng/nhân viên → đối soát với kế toán → công nợ theo người phụ trách → phiếu bất thường.
4. Tới **Câu hỏi gửi từng kế toán**: mỗi câu có "Căn cứ CRM", "Chị nhắn" (nút Sao chép), "Trả lời đạt là".
5. Sao chép → gửi Zalo → đánh dấu "Đã gửi" → khi có trả lời đánh dấu "Đã trả lời"/"Đạt".

### 5b. Kế toán / Kho (nếu Q10 bật)
- Chỉ thấy khối câu hỏi gửi đúng mình + bảng số liệu làm căn cứ của từng câu (ví dụ danh sách 9 phiếu giá 0).

## 6. Luồng vận hành (khi có sự cố)

| Tình huống | Hệ thống tự làm | Người cần làm |
|---|---|---|
| CRM đăng nhập lỗi (đổi mật khẩu) | Dừng quét, không công bố, banner đỏ "Không đăng nhập được CRM", gửi cảnh báo | Cập nhật `CRM_PASSWORD` trên Vercel → bấm Quét lại |
| CRM đổi giao diện (cột lệch) | Bước kiểm tra cấu trúc bảng phát hiện → dừng, không công bố, ghi rõ bảng/cột nào lệch | Sửa parser theo quy trình ở file 11 |
| Số đọc được ≠ số CRM báo (ví dụ đọc 2.150 mã, nhãn ghi 2.190) | Không công bố, ghi chênh lệch | Xem log, quét lại; nếu lặp lại thì sửa phân trang |
| AI lỗi / hết hạn mức API | Công bố số liệu bình thường, khối văn bản AI hiện "Chưa soạn được hôm nay" + giữ bản hôm trước có ghi ngày | Kiểm tra API key / hạn mức |
| Cron không chạy (Vercel) | Banner cam "Số liệu cũ N ngày" tự hiện theo ngưỡng | Kiểm tra Vercel → bấm Quét lại |

**Kênh cảnh báo** (chốt ở file 11): mặc định gửi email qua Gmail cho chủ dự án khi lần quét sáng thất bại.

## 7. Những gì người dùng KHÔNG làm trên dashboard (ngoài phạm vi)

- Không sửa dữ liệu CRM, không tạo công việc trên CRM từ dashboard.
- Không gửi Zalo tự động (chỉ sao chép).
- Không thay CRM làm nơi nhập liệu.
- Không tính lương/thưởng theo số liệu này.
