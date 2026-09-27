# CSKH — trạng thái, tương tác và accessibility

## Ma trận trạng thái màn hình

| Trạng thái | Header / summary | Danh sách và panel | Hành động |
|---|---|---|---|
| Đang tải ngày | Skeleton có kích thước ổn định; vẫn hiện ngày đã chọn | Skeleton vài dòng, không dựng tên giả | Giữ điều hướng ngày dùng được nếu không gây race |
| Chưa có run cho ngày | “Chưa lấy dữ liệu ngày DD/MM” và “—” thay chỉ số | Empty state phân biệt với 0 | Mở ngày gần nhất hoặc thử tải lại nếu có endpoint thật |
| Đã đối soát, có khách | Count chính thức, badge rõ, as-of | Danh sách và timeline đầy đủ | Search/filter/chọn khách/export thật |
| Chủ nhật 0, run thành công | `0 khách`; “Chủ nhật công ty nghỉ” | Empty state bình thường | Đổi ngày; không có cảnh báo đỏ |
| Ngày thường 0, filter chưa xác minh | `0 theo CRM` + “Cần kiểm tra bộ lọc” | Không hiển thị “không ai làm việc” | Xem lý do xác minh, thử nguồn nếu có quyền/công cụ |
| Ngày thường 0, filter xác minh | `0 theo CRM`; giải thích đã xác minh filter | Empty state trung tính; không suy ra đủ nhập liệu | Đổi ngày, xem as-of |
| Danh sách ít hơn CRM | Badge “Cần kiểm tra X/Y” | Danh sách phần đã có; lỗi thiếu tách rõ | Xem lỗi trích xuất, không export như báo cáo hoàn chỉnh nếu chưa ghi cảnh báo |
| Đủ danh sách, thiếu detail | “Danh sách khớp · chi tiết A/B” | Row có ký hiệu thiếu; panel ghi lỗi riêng | Xem lại khách thiếu, không gọi “đã đối soát đầy đủ” |
| Nguồn lỗi, có snapshot cũ | Ngày và as-of snapshot cũ + “Lần cập nhật gần nhất lỗi” | Giữ dữ liệu cũ, không tráo với ngày khác | Có retry nếu thật |
| Nguồn lỗi, không snapshot | “Không lấy được dữ liệu” | Không có số 0 giả | Thử lại / báo quản trị tùy quyền |
| Search/filter không kết quả | Số tổng ngày giữ nguyên | “Không có khách khớp bộ lọc”, nút xóa bộ lọc | Clear filter |
| Không có quyền xem detail | Tổng/danh sách theo quyền được phép hoặc không hiển thị | Panel “Không có quyền xem nội dung” | Không lộ note qua preview/export/API |

`stale` là một trạng thái có định nghĩa cấu hình (ví dụ vượt giờ chạy dự kiến của schedule); không tự chọn ngưỡng ngẫu nhiên. Sau khi người dùng chọn ngày quá khứ, “cũ” không đồng nghĩa lỗi: luôn xem `fetchedAt` và lịch sử run.

## Tương tác chi tiết

- **Date:** điều hướng bằng URL `?date=YYYY-MM-DD`; parse/validate trên server; ngày sai trả về hôm qua kèm thông báo hoặc 400 có hướng dẫn. Không dùng `dates[0]` làm default. Nhấn trước/sau không bỏ filter nếu filter còn hợp lệ, nhưng selection khách reset về dòng đầu trong tập mới.
- **Search:** tìm tên khách không phân biệt dấu/chữ hoa nếu kỹ thuật cho phép; input có label, nút xóa; debounce nhẹ nếu dữ liệu server. Kết quả hiển thị `X/Y`; không thay official total.
- **Staff filter:** lọc khách có ít nhất một activity của nhân viên chọn. Nếu khách có hai nhân viên, row vẫn một lần; panel hiển thị **toàn bộ** hoạt động của khách trong ngày, đánh dấu activity của nhân viên đang lọc nếu cần. Không ẩn những hoạt động khác mà không giải thích.
- **Selection:** trên desktop, URL có thể chứa `customer=<sourceCustomerId>` để giữ lựa chọn khi reload/back; ID không phải bí mật. Nếu ID nguồn nhạy cảm, dùng ID nội bộ hoặc không đưa vào URL. Nếu selection biến mất sau filter, chọn dòng đầu và thông báo ngắn cho screen reader.
- **Sort:** mặc định giờ hoạt động mới nhất giảm dần khi giờ đầy đủ; nếu thiếu giờ, tên A–Z. Bổ sung sort tên A–Z. Không cần nhiều cột sort kiểu spreadsheet.
- **Export:** chỉ bật sau khi có endpoint xuất CSV/XLSX/PDF thật; file chứa ngày báo cáo, nguồn, fetchedAt, official/list/detail counts, trạng thái đối soát, STT, khách, mọi activity (nhân viên/nội dung/kết quả/giờ). Nếu xuất theo filter, tên nút và file phải nói rõ. Tránh ghi note nhạy cảm vào log ứng dụng.
- **CRM link:** mở đúng customer sourceUrl đã allowlist host CRM và quyền; `target=_blank` kèm `rel=noopener noreferrer`. Nếu chưa có link, không vẽ nút.

## Accessibility

- Heading một H1; section H2; nav/region có tên; list row là button/link đúng semantics, không dùng `div onClick` đơn thuần.
- Tất cả chức năng dùng bàn phím; focus đỏ đủ tương phản, không bị che; phím Tab đi header → filter → list → detail → tổng hợp nhân viên. Không bắt buộc arrow-key custom nếu list chuẩn đã dùng được.
- Badge status có chữ, không chỉ icon/màu; aria-live lịch sự cho kết quả filter và trạng thái tải/đối soát thay đổi.
- Mobile detail có tiêu đề, nút đóng/quay lại, focus đưa vào detail khi mở và trả về row khi đóng. Không khóa cuộn sai.
- Vùng chạm ít nhất khoảng 44×44 px với nút ngày, filter, row. Ghi chú dài wrap, zoom 200% không gây mất nội dung hoặc nút chính.
- Nếu hiển thị thanh so sánh nhân viên, số liệu luôn có dạng văn bản; không dùng chỉ màu hoặc chiều dài thanh để hiểu kết quả.

## Quy tắc copy tránh sai nghĩa

| Tránh | Dùng khi phù hợp |
|---|---|
| “Không có khách” khi chưa chạy | “Chưa lấy dữ liệu ngày …” |
| “Đã xác minh 28/28” từ log cục bộ | “28 khách ghi nhận trên dashboard · chưa có số CRM để đối soát” |
| “Đã chăm sóc” cho activity thiếu ngày | “Hoạt động chưa xác định ngày” trong lỗi trích xuất |
| “Nhân viên hoàn thành 8 khách” | “8 khách riêng biệt có hoạt động do nhân viên này thực hiện” |
| “Hoạt động đã liên hệ” lấy từ `Customer.status` | Chỉ dùng tình trạng activity nếu CRM có trường tương ứng |
