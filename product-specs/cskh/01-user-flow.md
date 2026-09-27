# CSKH — luồng người dùng và quyết định

## Người dùng và 4 câu hỏi theo thứ tự

Người đọc chính: quản lý/điều hành cần xác nhận báo cáo ngày; người đọc phụ: nhân viên CSKH cần tra lại bản ghi của mình. Quyền xem chi tiết khách và nội dung chăm sóc phải tuân theo quyền truy cập hiện có của app/CRM, không mặc định ai cũng được đọc toàn bộ nếu chính sách thực tế hạn chế.

1. **Hôm qua có bao nhiêu khách?** Số chính thức từ bảng tổng hợp CRM, đi kèm ngày và giờ đồng bộ.
2. **Số này có đáng tin không?** So sánh số khách riêng biệt trong danh sách với tổng CRM; kiểm tra mức độ lấy được chi tiết cho từng khách. Hai phép kiểm riêng.
3. **Đó là ai, ai chăm sóc?** Danh sách khách theo ngày, tìm kiếm và lọc nhân viên, không bắt đọc toàn bộ log dạng bảng.
4. **Chăm sóc cụ thể ra sao?** Chọn khách để đọc timeline đủ giờ, nhân viên, nội dung/kết quả, tình trạng nguồn nếu có.

## Luồng mặc định

`Mở /customers` → ngày mặc định = hôm qua theo giờ Việt Nam → thấy tổng khách + trạng thái đối soát + thời điểm lấy → lướt danh sách khách → chọn một khách → đọc mọi lượt chăm sóc trong ngày → đổi khách mà không mất ngày/filter.

Ưu tiên hiển thị **ngày báo cáo**, không tự nhảy sang ngày có dữ liệu gần nhất. Nếu hôm qua chưa có run, nói “Chưa lấy dữ liệu ngày …” và đưa ngày gần nhất như lối đi phụ; không thay ngầm báo cáo hôm qua bằng báo cáo cũ.

## Luồng kiểm tra chênh lệch

Nếu CRM báo 28 khách, dashboard có 27 khách: header hiển thị “Cần kiểm tra · 27/28 khách”, vùng lỗi dẫn tới đúng danh sách bản ghi thiếu hoặc phần trích xuất thất bại nếu có định danh. Nếu có 28 tên nhưng chỉ 26 khách lấy được hoạt động: hiển thị “28/28 khách · chi tiết 26/28”, không gắn nhãn “Đã đối soát đầy đủ”. Người dùng có thể mở danh sách “Thiếu chi tiết”.

## Luồng ngày 0 khách

- **Chủ nhật, run thành công, số CRM = 0:** “Chủ nhật công ty nghỉ, không phát sinh hoạt động chăm sóc”. Đây là kết quả hợp lệ, không tạo cảnh báo đỏ.
- **Ngày khác, CRM = 0:** “Chưa ghi nhận khách hàng; cần kiểm tra bộ lọc CRM”. Chỉ chuyển sang “0 khách đã xác minh” khi quy trình đối chiếu ngày gần đó xác nhận filter hoạt động và nguồn thật sự bằng 0. Kiểm tra filter không chứng minh nhân viên đã nhập đủ hoạt động; copy không được khẳng định quá mức.
- **Không có run hoặc nguồn lỗi:** “Chưa có dữ liệu”/“Không lấy được dữ liệu”, tuyệt đối không suy ra 0.

## Luồng tra cứu và xuất

Đổi ngày → báo cáo, tổng và trạng thái cùng đổi theo ngày; từ URL có thể chia sẻ `?date=yyyy-mm-dd`. Tìm tên khách và lọc nhân viên chỉ thu hẹp danh sách hiển thị; tổng chính thức ở đầu trang **không thay đổi**. Cho biết “Hiển thị N/M khách” sau lọc. Export nếu có phải ghi rõ nó xuất toàn bộ ngày hay theo bộ lọc; mặc định xuất toàn bộ ngày với metadata đối soát và as-of. Không xuất trạng thái “đã xác minh” nếu run chưa đủ điều kiện.

## Không nhắm tới trong màn này

Không lập danh sách khách cần gọi, điểm ưu tiên, pipeline “đã mua”, doanh thu, KPI tăng giảm vô căn cứ, hay nút “Pay out/Đã xử lý”. Chúng không trả lời yêu cầu báo cáo chăm sóc hôm qua.
