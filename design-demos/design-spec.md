# Định hướng thiết kế — Dashboard theo dõi công việc

## Bối cảnh

Ứng dụng nội bộ của Bao Bì Giấy Toàn Quốc đang dùng Next.js để theo dõi chăm sóc khách hàng, công nợ và email. Người dùng là quản trị, sales và các bộ phận vận hành. Họ mở dashboard nhiều lần trong ngày để nắm tình hình, nhìn thấy dữ liệu đã đồng bộ và đi nhanh tới khu vực cần xem chi tiết. Trang Tổng quan hiện có bốn chỉ số: khách hàng đã chăm sóc, tổng lượt chăm sóc, lượt chăm sóc hai ngày gần đây và email công việc. Bên dưới là khối chăm sóc khách hàng và danh sách email mới nhất. Menu hiện hiển thị Tổng quan, Chăm sóc khách hàng, Công nợ, Email. Các trang khác có trong code nhưng đang ẩn. Thiết kế mới phải bắt nguồn từ chính các nội dung này, tránh đưa thêm chức năng hoặc số liệu mà ứng dụng chưa có.

## Đầu ra và kích thước

Ba bản HTML đơn tĩnh, mỗi bản thể hiện một màn hình Tổng quan ở khung 1440 × 900. Mỗi bản được lưu riêng và mở trực tiếp trên trình duyệt. Nội dung dữ liệu là số minh họa có nhãn rõ ràng; khi triển khai sẽ thay bằng dữ liệu Prisma đang có. Giao diện cần cho thấy cách áp dụng lên các trang danh sách: kiểu menu, thanh tiêu đề, thẻ chỉ số, panel, bảng và trạng thái đồng bộ. Trên màn hình nhỏ, bố cục phải co lại hợp lý, không có cuộn ngang ngoài ý muốn. Cỡ chữ nội dung từ 14px, nhãn nhỏ từ 12px, tương phản đủ rõ để làm việc trong thời gian dài.

## Nội dung bắt buộc

Giữ tên tổ chức dạng chữ vì repo không có logo. Menu chính bốn mục giữ nguyên tên và thứ tự. Tiêu đề là “Tổng quan”. Phần chính có bốn chỉ số đúng với ứng dụng. Có vị trí rõ cho trạng thái đồng bộ ở khu vực chăm sóc khách hàng và email. Có khối dẫn tới trang chăm sóc khách hàng. Có danh sách email mới nhất gồm chủ đề và ngày. Nút hay đường dẫn trong bản xem trước chỉ nhằm thể hiện cách nhìn, không gợi ý rằng một thao tác mới đã tồn tại. Không thêm biểu đồ xu hướng vì trang hiện chưa có chuỗi dữ liệu tương ứng. Tránh ảnh trang trí: đây là công cụ dữ liệu, ảnh không bổ sung thông tin. Thay vào đó dùng chữ, khoảng trống, đường kẻ và tương phản hình khối để tạo bản sắc.

## Tính cách và giả định

Mục tiêu là sạch, đáng tin, dễ quét, có cá tính vừa đủ cho một công cụ nội bộ ngành bao bì giấy. Giữ cảm giác chuyên nghiệp hơn kiểu landing page. Ba bản cần khác nhau ở cấu trúc: một bản điều hướng ngang sáng ấm; một bản điều hướng trái với mật độ cao và nền tối; một bản dạng bàn điều hành có thanh công cụ ngang và khu vực ưu tiên việc cần xem. Bản đầu lấy cảm hứng từ nhịp biên tập ấm, bản thứ hai tham khảo cách Linear tổ chức vùng làm việc, bản thứ ba được tùy chỉnh theo nhịp vận hành của công ty. Không có logo, bộ nhận diện, ảnh sản phẩm hay website tham khảo do người dùng cung cấp ở thời điểm dựng; đây là các giả định có thể điều chỉnh sau khi họ chọn hướng.
