# CSKH — báo cáo chăm sóc khách hàng theo ngày

## Mục đích đã chốt

Người dùng cần biết **hôm qua CRM ghi nhận bao nhiêu khách hàng đã được chăm sóc, đó là những khách nào, ai chăm sóc, vào giờ nào, nội dung/kết quả ra sao**, và liệu danh sách đã khớp với số tổng hợp chính thức hay chưa. Màn này là công cụ đọc và kiểm tra báo cáo ngày, không phải pipeline bán hàng hay hàng chờ follow-up.

Nguồn nghiệp vụ: module `Customer_Cares` của Incomsoft CRM; số tổng theo bảng “Tổng hợp kết quả Chăm sóc”; chi tiết hoạt động từ tab “Hoạt động” của từng khách. Ngày mặc định là **hôm qua theo `Asia/Ho_Chi_Minh`**, không phải ngày đồng bộ gần nhất. Chủ nhật công ty nghỉ: 0 khách có thể là kết quả bình thường nếu lần lấy dữ liệu thành công. Ngày khác có 0 khách phải xác minh bộ lọc nguồn.

Ảnh demo trước đây chỉ là bản tham khảo và chứa dữ liệu minh họa. Bản UI thử hiện tại ở `/customers` dùng đỏ–trắng: khối kết quả chính + chart nhân viên → danh sách khách + panel hoạt động. Palette ở [visual-system.md](../shared/visual-system.md).

## V1 và ranh giới

- V1: báo cáo một ngày, tìm/lọc khách, đọc toàn bộ hoạt động trong ngày, xem số khách riêng biệt theo nhân viên, trạng thái đối soát/thiếu dữ liệu, chọn ngày lịch sử, xuất báo cáo nếu đã làm thật.
- Không gắn “đã liên hệ/chờ phản hồi” từ `Customer.status`: đó là trạng thái khách, không phải trạng thái hoạt động. Chỉ hiển thị tình trạng hoạt động nếu CRM gửi trường tương ứng.
- Không có nút ghi care, sửa dữ liệu CRM hay giao việc trong V1. Link mở CRM chỉ xuất hiện khi có URL/ID nguồn hợp lệ và quyền phù hợp.
- Không để dashboard tự tuyên bố đã đối soát dựa trên `CareLog` cục bộ: cần `officialCustomerCount`, danh sách ID khách nguồn và tình trạng lấy chi tiết.

## Thứ tự đọc

1. [Luồng người dùng](01-user-flow.md)
2. [Đặc tả màn hình](02-screen-spec.md)
3. [Hợp đồng dữ liệu và đối soát](03-data-contract.md)
4. [Trạng thái và tương tác](04-states-and-interactions.md)
5. [Task triển khai và nghiệm thu](05-execution.md)
