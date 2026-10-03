# Dashboard quản trị CRM — kế hoạch triển khai

> Bộ tài liệu này biến bản dashboard tĩnh mà client đã duyệt (`crm-dashboard-spec/`) thành một tính năng thật của project: **tự quét CRM mỗi ngày, tự tính số, tự viết việc cần giao, lưu lịch sử, hiển thị trên web**. Đây là plan, chưa phải code.
>
> Nguồn đầu vào: [dashboard_ui_spec.md](../../crm-dashboard-spec/dashboard_ui_spec.md), [metrics_source_spec.md](../../crm-dashboard-spec/metrics_source_spec.md), `dashboard_data.json`, `ref_cskh.html`, `ref_kho.html` (thư mục `crm-dashboard-spec/` chứa dữ liệu thật, **không commit**).

## 1. Client muốn gì (tóm một câu)

Chị Hiền (giám đốc) mở một trang mỗi sáng là biết: **nhân viên nào đang bỏ sót khách nào, cần giao việc gì, hỏi ai câu gì, và kho – xuất bán – công nợ có chỗ nào lệch cần kế toán giải trình** — mà không phải tự mở CRM hay nhờ ai chạy báo cáo bằng tay.

## 2. Hiện trạng và khoảng cách

| | Hiện nay (bản client duyệt) | Đích của plan này |
|---|---|---|
| Cách lấy dữ liệu | Claude in Chrome trên máy chị, chạy tay, phải mở Chrome và đăng nhập | Server tự quét bằng HTTP mỗi ngày, không cần máy ai bật |
| Tần suất | Thất thường (17/08 → 22/09 bị ngưng hơn 1 tháng) | Hằng ngày + nút "Quét lại" khi cần |
| Kết quả | 1 file HTML tĩnh, số liệu đóng băng tại lúc quét | Trang web trong dashboard hiện có, luôn đọc bản quét mới nhất |
| Văn bản "việc cần giao", "câu hỏi" | AI viết tay mỗi lần chạy | AI viết tự động từ số liệu, có kiểm soát, chị sửa được |
| Lịch sử | Không có (chỉ nhớ "lần quét trước") | Lưu mọi lần quét, so sánh được giữa các mốc |
| Theo dõi đã hỏi/đã trả lời | Không có | Trạng thái từng câu hỏi lưu trong database |

## 3. Bộ tài liệu

| File | Nội dung | Trạng thái |
|---|---|---|
| [00-README.md](00-README.md) | Tổng quan, mục lục, trạng thái | ✅ Xong |
| [01-quyet-dinh.md](01-quyet-dinh.md) | 14 quyết định client/chủ dự án phải chốt trước khi code | ✅ Xong, **chờ chốt** |
| [02-luong-nguoi-dung.md](02-luong-nguoi-dung.md) | Ai dùng, dùng lúc nào, từng bước thao tác | ✅ Xong |
| [03-kien-truc-he-thong.md](03-kien-truc-he-thong.md) | Các khối hệ thống, luồng dữ liệu hằng ngày, xử lý lỗi | ✅ Xong |
| 04-nguon-du-lieu-crm.md | Khảo sát 4 module CRM: request thật, tham số, cột, phân trang, ID | ⏳ Lượt sau |
| 05-mo-hinh-du-lieu.md | Bảng database (Prisma), khóa chống trùng, lưu trữ lịch sử | ⏳ Lượt sau |
| 06-chi-so-cskh.md | Công thức từng số trang CSKH, đã sửa lỗi spec gốc, ca biên | ⏳ Lượt sau |
| 07-chi-so-kho-cong-no.md | Công thức trang Kho · Xuất bán · Công nợ | ⏳ Lượt sau |
| 08-lop-ai.md | Phân nhóm khách + sinh việc cần giao + câu hỏi: prompt, kiểm chứng, chi phí | ⏳ Lượt sau |
| 09-giao-dien.md | Từng component, trạng thái, responsive, ánh xạ dữ liệu → UI | ⏳ Lượt sau |
| [10-lo-trinh-trien-khai.md](10-lo-trinh-trien-khai.md) | 8 giai đoạn, việc cụ thể, file sửa, điều kiện xong | ✅ Xong (bản khung, chi tiết dần) |
| 11-kiem-thu-van-hanh.md | Kiểm thử, giám sát, cảnh báo lỗi, quy trình khi CRM đổi giao diện | ⏳ Lượt sau |
| [13-demo-v2.md](13-demo-v2.md) | Bản demo v2: plan, 25 cải tiến, giả định, bảng đối chiếu 26 yêu cầu với bản mẫu, kết quả kiểm thử | ✅ Xong |
| [12-van-de-trong-spec-goc.md](12-van-de-trong-spec-goc.md) | 38 điểm lệch/lỗi phát hiện khi đọc spec + dữ liệu + HTML mẫu (4 mức đỏ) | ✅ Xong |

**Thứ tự đọc khuyên dùng:** 00 → 01 (chốt quyết định) → 02 → 03 → 10 → 12, rồi các file chi tiết khi tới giai đoạn tương ứng.

## 4. Nguyên tắc xuyên suốt (áp dụng cho mọi file)

1. **Số liệu phải tái tạo được.** Mọi con số trên dashboard truy ngược được về bản ghi CRM cụ thể (mã công việc, mã phiếu, mã khách). Không có số "do AI ước lượng".
2. **AI chỉ viết lời, không bịa số.** Lớp AI nhận số đã tính sẵn và chỉ diễn đạt; mọi con số trong văn bản AI phải khớp số trong dữ liệu (có bước tự kiểm).
3. **Lỗi thì giữ bản cũ, không ghi đè.** Lần quét thiếu hoặc lệch kiểm tra → không công bố, trang vẫn hiện bản tốt gần nhất kèm cảnh báo rõ ràng (đúng mục 5.7 spec gốc).
4. **Không có nút chết, không có số giả.** Chức năng chưa làm thì không vẽ nút (giữ quy tắc của `product-specs/shared/visual-system.md`).
5. **Không cứng ngày tháng.** Mọi mốc ("10/08", "22/09", "kỳ 23/09 → 03/10") lấy từ dữ liệu/cấu hình, không viết chết trong code hay nhãn.
6. **Bảo mật dữ liệu khách.** Tên khách, công nợ, ghi chú chỉ xem được sau đăng nhập; không đưa vào log, URL, Git, hay ảnh demo.
7. **Giờ Việt Nam.** Mọi ngày nghiệp vụ tính theo `Asia/Ho_Chi_Minh`.

## 5. Quan hệ với tài liệu cũ trong repo

- `product-specs/cskh/` mô tả **báo cáo chăm sóc theo từng ngày** (nguồn `Customer_Cares`). Spec mới của client là **dashboard quản trị theo kỳ** (nguồn `Tasks`). Hai thứ trùng tên "CSKH" nhưng khác mục tiêu → xem quyết định **Q1** trong [01-quyet-dinh.md](01-quyet-dinh.md).
- Các nguyên tắc dữ liệu tốt của spec cũ (đối soát, ID nguồn, chống trùng, không suy ra 0 khi chưa quét, giờ VN) **được giữ nguyên** và áp dụng cho plan này.
- Cron `/api/cron/care` vừa deploy (commit `bc72508`) là bước thử nghiệm cách quét HTTP. Plan này mở rộng nó; số phận của nó nằm ở Q1.

## 6. Trạng thái tổng

| Hạng mục | Trạng thái |
|---|---|
| Phân tích spec + dữ liệu + HTML mẫu | Xong |
| Quyết định của client | **Chưa chốt** — chặn giai đoạn 1 trở đi |
| Khảo sát 4 module CRM bằng request thật | Chưa làm — cần quyền truy cập CRM qua trình duyệt |
| Code | Chưa bắt đầu (ngoài cron thử nghiệm `/api/cron/care`) |
