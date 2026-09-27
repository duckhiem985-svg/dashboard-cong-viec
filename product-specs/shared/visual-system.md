# Hệ giao diện dùng chung — đỏ và trắng

## Ý đồ

Đỏ là màu nhận diện và hành động, trắng là nền chính. Màn hình phải sáng, thoáng và có nhịp đọc rõ; không nhuộm cả dashboard thành đỏ. Màu trạng thái dùng chữ/biểu tượng trước màu sắc để không nhầm “được xác minh” với “cảnh báo”. Ảnh mockup CSKH trước đây chỉ dùng làm tham khảo cấu trúc master–detail; bảng màu xanh trong ảnh **không còn hiệu lực**.

## Token đề xuất để triển khai

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#FAFAF9` | Nền toàn trang |
| `--surface` | `#FFFFFF` | Card, panel, popover |
| `--surface-soft` | `#FFF7F6` | Dòng được chọn, vùng nhấn nhẹ |
| `--red-50` | `#FFF1F0` | Hover/nhấn rất nhẹ |
| `--red-100` | `#FDDCD9` | Viền trạng thái có nhấn |
| `--red-600` | `#C62828` | CTA chính, nav active, focus |
| `--red-700` | `#A51D22` | Hover CTA |
| `--red-900` | `#6B171B` | Chữ nhấn trên nền sáng |
| `--ink` | `#201C1D` | Chữ chính |
| `--muted` | `#686365` | Chữ phụ |
| `--line` | `#EAE6E5` | Viền, phân cách |
| `--success-ink` | `#166534` | Dấu xác minh nhỏ, chỉ khi đúng |
| `--warning-ink` | `#92400E` | Cần xác minh |

Kiểm tra tương phản thực tế khi code; nếu cặp màu không đạt WCAG AA cho cỡ chữ sử dụng thì điều chỉnh token, không giảm cỡ chữ để giữ đúng mẫu. Một khối dữ liệu chính mỗi màn có thể dùng đỏ đậm toàn khối để tạo điểm nhấn; các khối còn lại giữ nền trắng. Xanh lá/vàng chỉ xuất hiện trong trạng thái nghiệp vụ nhỏ và luôn có nhãn chữ.

## Typography, mật độ, không gian

- UI tiếng Việt: sans dễ đọc, ưu tiên font hiện có Geist Sans; không dùng serif trang trí trong khu vực dữ liệu. Tiêu đề trang 28–32 px, tiêu đề vùng 18–20 px, body 14–16 px, nhãn phụ 12–13 px, line-height thân ≥ 1.45.
- Số liệu dùng `tabular-nums`. Đơn vị và kỳ đo ngay cạnh số; không dùng số to không chú giải.
- Spacing cơ sở 4 px; khoảng cách phổ biến 8/12/16/24/32 px. Card padding 20–24 px desktop, 16 px mobile. Bán kính 12 px card, 8 px control, pill chỉ cho badge/filter.
- Khung trang desktop tối đa khoảng 1440 px. Chiều rộng nội dung cần đọc không bị trải hết màn 4K. Giao diện ưu tiên thông tin quan trọng trong viewport đầu ở 1366×768.
- Viền mảnh thay cho bóng nặng. Không dùng hình người, ảnh stock, biểu đồ trang trí hay gradient lớn.

## Shell và điều hướng

- Desktop: sidebar trái khoảng 208–224 px, logo doanh nghiệp thật; mục đang chọn là nền đỏ nhạt + vạch/chữ đỏ đậm. Header nội dung là tiêu đề, ngày/bộ lọc chính và 1 thao tác phụ phù hợp.
- Tablet: sidebar thu gọn hợp lý, luôn còn nhãn hoặc cơ chế mở menu dễ nhận ra.
- Mobile: điều hướng gọn; tiêu đề, ngày và trạng thái dữ liệu nằm trước danh sách. Panel chi tiết chuyển thành màn/overlay riêng có nút quay lại rõ.
- Các trang kế tiếp dùng cùng shell; không đổi shell theo từng trang nếu không có lý do nghiệp vụ.

## Components chuẩn

| Component | Quy tắc |
|---|---|
| Button primary | Đỏ đặc, chữ trắng, chỉ cho hành động quan trọng thực sự khả dụng. Một vùng chính tối đa một CTA primary. |
| Button secondary | Trắng, viền xám, chữ chính; export, mở nguồn, đổi chế độ. |
| Button ghost/icon | Dùng cho thao tác phụ; icon đơn phải có accessible name và tooltip nếu ý nghĩa không rõ. |
| Filter | Có nhãn, trạng thái chọn và cách xóa. Ngày được hiển thị `dd/MM/yyyy`. |
| Status badge | Có chữ và icon; “Đã đối soát”, “Chưa đủ dữ liệu”, “Cần kiểm tra”, “Đồng bộ lỗi” không dùng chung một màu. |
| List row | Tối thiểu 56 px; vùng nhấp cả dòng; trạng thái chọn nhìn rõ cả khi không thấy màu. |
| Detail panel | Tiêu đề và nguồn rõ; nội dung dài cuộn bên trong, không làm danh sách nhảy độ cao. |
| Empty/error | Nói rõ ý nghĩa nghiệp vụ và hành động tiếp theo nếu có; không ghi chung “Không có dữ liệu”. |

## Luật nội dung

- Copy gần ngôn ngữ người dùng: “Khách hàng đã chăm sóc”, “Lượt chăm sóc”, “Nguồn: CRM Incomsoft”, “Lấy lúc 08:12”.
- Ngày báo cáo và giờ chăm sóc là hai trường khác nhau. Mọi ngày theo múi giờ nghiệp vụ Việt Nam; giờ hiển thị dạng `HH:mm`.
- Không đặt nút “Xuất báo cáo”, “Xem trong CRM”, “Đã xử lý” nếu hành động chưa hoạt động thật. Prototype được ghi là prototype; bản production phải ẩn hoặc giải thích chức năng chưa có.
- Tên khách dài phải wrap/truncate có cách xem đầy đủ; ghi chú nhiều dòng chỉ preview trong list, xem nguyên văn trong detail.
