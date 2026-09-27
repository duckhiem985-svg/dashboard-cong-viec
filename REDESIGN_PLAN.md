# Kế hoạch thiết kế lại dashboard công việc

## 1. Mục tiêu sản phẩm

Người dùng mở web để biết **hôm nay cần xử lý gì**, xử lý nhanh và biết kết quả. Mỗi màn hình phải trả lời một câu hỏi công việc, không dùng số tổng để lấp khoảng trống. Giao diện lấy nhịp gọn, điều khiển dạng pill, các khối thông tin có chức năng và panel chi tiết từ hai ảnh tham chiếu người dùng cung cấp. Không sao chép nội dung tài chính, hình đại diện hay nút không có hành động tương ứng.

Luồng mặc định: đăng nhập → hàng chờ ưu tiên theo vai trò → chọn một việc → xem ngữ cảnh và lịch sử trong panel chi tiết → xử lý trên web hoặc mở đúng bản ghi ở hệ thống nguồn → hàng chờ cập nhật. Nếu nguồn dữ liệu chỉ đọc, nút phải ghi rõ “Mở trong CRM/Gmail/Sheet/Calendar”; không hiển thị nút “Đã xử lý” khi không thể đồng bộ kết quả.

## 2. Khung giao diện dùng chung

- **Desktop:** thanh điều hướng trái gọn (Tổng quan, Khách hàng, Công nợ, Email, Lịch), trên cùng là tiêu đề ngữ cảnh, tìm kiếm toàn cục, tình trạng đồng bộ và tài khoản. Vùng giữa dùng lưới 12 cột: phần việc chính 8 cột, ngữ cảnh/phân tích 4 cột. Màn danh sách dùng list + panel chi tiết như ảnh hóa đơn tham chiếu, giữ bộ lọc khi chuyển bản ghi.
- **Màn nhỏ:** thanh điều hướng rút gọn; bộ lọc quan trọng nằm trên danh sách; panel chi tiết mở toàn màn. Không ép bảng nhiều cột cuộn ngang để làm thao tác chính.
- **Ngôn ngữ thị giác:** nền sáng trung tính, chữ sans rõ, xanh dương cho thao tác chính, xanh chanh rất tiết chế cho trạng thái đang được chọn, charcoal cho vùng làm việc cần tập trung. Bo góc mềm nhưng nhất quán. Ảnh chỉ xuất hiện nếu là ảnh hồ sơ hoặc tư liệu thật có ích.
- **Nút:** mỗi màn chỉ một nút chính theo tác vụ. Nút phụ là viền/ghost; thao tác trên dòng nằm ở menu hoặc xuất hiện khi chọn dòng. Chỉ dùng biểu tượng đơn lẻ khi có nhãn hỗ trợ và tooltip. Bộ lọc là chip có thể xóa, trạng thái là pill có chữ và màu. Không đặt “Xem chi tiết” chung chung ở mọi nơi.
- **Trạng thái dữ liệu:** từng module ghi “Dữ liệu đến thời điểm…”, nguồn và cảnh báo chậm đồng bộ. Phân biệt chưa có dữ liệu, hôm nay không phát sinh, không có kết quả lọc, đang tải và lỗi nguồn. Mọi con số có kỳ đo và đơn vị; ô tổng có thể nhấn để mở danh sách đã lọc.

## 3. Các màn hình đang hiện trong menu

### Tổng quan — trang mở đầu theo vai trò

**Câu hỏi:** Việc gì cần chú ý và làm tiếp ngay?

**Bố cục:** (1) lời chào ngắn + ngày + trạng thái đồng bộ; (2) tối đa ba chỉ số có thể hành động: việc đến hạn hôm nay, khoản nợ quá hạn, khách cần liên hệ (thay đổi theo vai trò); (3) hàng chờ ưu tiên chiếm phần lớn màn hình, mỗi dòng có loại việc, đối tượng, lý do ưu tiên, hạn, người phụ trách và CTA; (4) cột phụ gồm lịch hôm nay/tuần này và 1–2 insight thay đổi so với kỳ trước; (5) hoạt động gần đây chỉ là nội dung thứ cấp. Không lặp lại cùng một số ở hero và card.

**Luồng:** chọn “Công nợ quá hạn” → trang Công nợ đã lọc; chọn khách → panel hồ sơ; chọn email → hộp thư đúng thread; chọn lịch → chi tiết sự kiện. Hàng chờ có thể gom theo “Cần xử lý”, “Đang chờ”, “Đã xong”.

**Dữ liệu:** hiện có số chăm sóc, công nợ, email và sự kiện; thiếu quy tắc ưu tiên, deadline chăm sóc, trạng thái email, người chịu trách nhiệm cho nợ/email. Trước khi có đủ dữ liệu, chỉ hiển thị hàng chờ nào tính được chính xác; không tự gán nhãn “khẩn cấp”.

### Chăm sóc khách hàng — workspace của Sales

**Câu hỏi:** Tôi cần liên hệ ai, lần trước trao đổi gì, bước tiếp theo là gì?

**Bố cục:** header có tìm kiếm theo tên/số điện thoại và nút hành động; tab “Cần liên hệ”, “Đang theo dõi”, “Đã mua”, “Tất cả”; bộ lọc người phụ trách và khoảng thời gian. Bên trái là danh sách khách với tên, giai đoạn, lần chăm sóc cuối, bước tiếp theo và mức ưu tiên. Bên phải là hồ sơ khách: thông tin liên hệ, timeline chăm sóc, đơn hàng liên quan, ghi chú và lịch hẹn. Thống kê theo nhân viên là tab phân tích riêng, không chắn tác vụ chính.

**Luồng:** mở khách → đọc tương tác cuối → gọi/gửi email/mở CRM → ghi nhận kết quả → đặt lần liên hệ tiếp theo. Nếu dashboard chỉ đọc, thay ba hành động cuối bằng deep link tới CRM và hiện lại trạng thái sau lần đồng bộ kế tiếp.

**Dữ liệu hiện có:** tên, điện thoại tùy chọn, trạng thái, sales phụ trách, log ngày/nội dung/kết quả. **Cần thêm:** CRM customer ID ổn định, email/số điện thoại đáng tin, ngày hẹn tiếp theo, trạng thái pipeline chuẩn, mức ưu tiên và lý do, giá trị cơ hội/đơn hàng, URL hồ sơ CRM; API ghi log nếu thao tác trực tiếp trên web. Hiện ingest ghép khách theo tên nên có nguy cơ trùng hoặc ghép sai.

### Công nợ — màn thu hồi theo hạn

**Câu hỏi:** Khoản nào cần nhắc hôm nay và ảnh hưởng tiền mặt bao nhiêu?

**Bố cục:** đầu trang là nợ quá hạn, đến hạn 7 ngày, số khoản cần theo dõi (có kỳ và số khách); thanh thời gian/aging buckets 0–7, 8–30, >30 ngày; dưới là danh sách ưu tiên theo hạn, số dư và lịch nhắc. Chọn một khoản mở panel phải với hóa đơn, số tiền gốc/đã thu/còn lại, lịch thanh toán, người phụ trách, liên hệ khách và ghi chú. Bộ lọc “Quá hạn”, “Sắp đến hạn”, “Đang chờ xác nhận”, “Tất cả”.

**Luồng:** chọn khoản → xem lần thu/nhắc gần nhất → mở chứng từ hoặc gửi nhắc qua công cụ nguồn → ghi nhận kết quả → quay lại hàng chờ. Không có nút “Đã thu” trước khi có đồng bộ hai chiều và phân quyền kế toán.

**Dữ liệu hiện có:** tên khách, số dư, ngày đến hạn tùy chọn, `daysOverdue`, ghi chú; đồng bộ bằng snapshot thay toàn bộ bảng. **Cần thêm:** mã khách và mã hóa đơn/khoản thu, ngày đến hạn bắt buộc, số tiền gốc/đã thu/còn lại, lịch thanh toán, người phụ trách, lần nhắc gần nhất, phương thức liên hệ, trạng thái xác nhận. Schedule hiện thường gửi `daysOverdue: 0`, nên chỉ số nợ quá hạn phải tính từ dueDate đã được xác thực, không lấy trường này làm nguồn chân lý.

### Email — hộp thư để phân loại và chuyển việc

**Câu hỏi:** Thư nào cần đọc/trả lời/giao cho người khác?

**Bố cục:** thanh trên có tìm kiếm, lọc thời gian, người gửi, loại; tab “Cần xử lý”, “Đang chờ phản hồi”, “Đã xử lý”, “Tất cả”. Danh sách giữa có người gửi, tiêu đề, tóm tắt một dòng, thời gian, khách liên quan và trạng thái. Panel phải hiển thị thread, nội dung/tóm tắt, file đính kèm và hành động. Có thể biến email thành việc/lịch theo quyền và nguồn tích hợp.

**Luồng:** mở email → hiểu nội dung mà không rời trang → trả lời trong Gmail hoặc gắn với khách/việc → cập nhật trạng thái. Nếu chỉ đọc, CTA rõ là “Mở trong Gmail”.

**Dữ liệu hiện có:** sender, subject, receivedAt, summary, category. **Cần thêm:** Gmail message ID/thread ID và URL, snippet/body an toàn, trạng thái chưa đọc/đã trả lời/đang chờ, người phụ trách, người nhận, liên kết CRM customer ID, cờ file đính kèm. Ingest hiện luôn tạo record mới nên có thể nhân bản cùng một email sau nhiều lần đồng bộ; cần upsert theo ID nguồn.

### Lịch công việc — ngày và tuần

**Câu hỏi:** Hôm nay có gì, việc nào đến hạn, lịch nào xung đột?

**Bố cục:** chuyển Ngày/Tuần, hàng sự kiện hôm nay ở trên, tuần kế tiếp dạng timeline gọn; có lọc “Của tôi/Của nhóm”. Mỗi item có giờ bắt đầu–kết thúc, tên, loại (cuộc họp/việc cần làm), chủ sở hữu, địa điểm hoặc link họp, nguồn và trạng thái. Nút chính “Tạo việc” chỉ bật khi có API ghi; nếu không, “Mở Google Calendar”.

**Luồng:** chọn sự kiện → xem đủ thông tin → mở nguồn, tham gia họp hoặc hoàn thành việc. Chỉ việc cần làm có checkbox; cuộc họp không dùng trạng thái “đã xong” kiểu checklist.

**Dữ liệu hiện có:** externalId, tiêu đề, một mốc thời gian, cờ done, người được giao tùy chọn. **Cần thêm:** loại item, giờ kết thúc, all-day, timezone, địa điểm/link họp, mô tả, người tham gia, trạng thái hủy/đổi lịch, quyền ghi ngược. Checkbox hiện chỉ đổi DB của dashboard, không cập nhật Google Calendar nên cần quy định nguồn chân lý.

### Đăng nhập

Trang gọn, ưu tiên form và độ tin cậy: logo/tên, một câu mô tả, hai trường, nút đăng nhập, lỗi rõ ngay tại form, hướng dẫn liên hệ quản trị. Không dùng hero chiếm nửa màn vì đây là cửa vào công cụ nội bộ, không phải trang marketing. Sau đăng nhập đi đến hàng chờ phù hợp với vai trò.

## 4. Các route đang có nhưng ẩn khỏi menu

Chỉ đưa lên điều hướng khi dữ liệu đáng tin và có người dùng chịu trách nhiệm. Gom thành nhóm “Phân tích” hoặc theo vai trò, không thêm năm mục vào menu chính cùng lúc.

| Route | Vai trò và cách trình bày đề xuất | Dữ liệu cần bổ sung |
|---|---|---|
| Doanh thu | Xu hướng so với mục tiêu, nguồn đóng góp, đơn hàng tạo doanh thu; chọn điểm trên biểu đồ mở giao dịch gốc. | Mục tiêu kỳ, đơn hàng/hóa đơn ID, hoàn trả, giá vốn, owner. |
| Tài chính | Thu–chi và dòng tiền dự kiến, giao dịch cần đối soát; phần công nợ dẫn đến màn Công nợ chung, tránh hai trang nợ trùng nhau. | Số dư đầu/cuối kỳ, tài khoản, chứng từ, trạng thái đối soát, khoản phải trả. |
| Kho | Hàng sắp thiếu theo ngưỡng và số ngày đủ dùng, danh sách cần đặt thêm, lịch sử xuất nhập trong panel mặt hàng. | Ngưỡng tồn tối thiểu theo SKU, lead time, hàng đang đặt, hàng giữ cho đơn, giá trị tồn. |
| Google Ads | Chi tiêu → lead → đơn hàng/giá trị, so với mục tiêu; xếp chiến dịch theo hiệu quả, không chỉ tổng click. | Lead ID, doanh thu gắn chiến dịch, mục tiêu CPA/ROAS, attribution. |
| Facebook | Bài đăng/chủ đề hiệu quả và lead tạo ra, xu hướng theo thời gian; tránh bảng tổng view đơn thuần. | Post ID, link bài, click/lead/conversion, chi phí nếu có quảng cáo, mục tiêu. |

## 5. Dữ liệu và quy tắc cần chốt trước khi thiết kế chi tiết

**Ưu tiên P0:** (1) xác nhận vai trò và ai được xem/sửa từng module; (2) chốt web là nơi thao tác hay nơi xem và mở công cụ nguồn; (3) ID ổn định giữa CRM–công nợ–email–lịch, ít nhất là customer ID và source record ID; (4) timestamp của bản ghi, thời điểm đồng bộ, trạng thái lỗi và kỳ dữ liệu; (5) định nghĩa “cần xử lý”, “quá hạn”, “cần chăm sóc” do nghiệp vụ duyệt. Thiếu P0 thì trang Tổng quan phải dùng các danh sách có thật, không dựng hàng chờ giả.

**Ưu tiên P1:** lịch sử thanh toán, follow-up khách, trạng thái email/thread, sự kiện lịch đầy đủ; API ghi ngược nguồn và nhật ký ai đã thao tác. **P2:** chỉ tiêu doanh thu, hiệu quả marketing, dự báo tồn kho, các insight sâu.

## 6. Thứ tự triển khai và tiêu chí nghiệm thu

1. Kiểm kê dữ liệu thực tế và chốt 2 câu hỏi P0 về quyền thao tác/vai trò; ghi định nghĩa từng chỉ số. Thiết kế luồng với dữ liệu mẫu được đánh dấu rõ.
2. Dựng mẫu có thể bấm của **Tổng quan → danh sách Công nợ → panel khoản nợ** và **Khách hàng → hồ sơ → hành động tiếp theo**; đồng thời mẫu mobile. Duyệt bố cục, mật độ, nút và luồng trước khi sửa app.
3. Xây shell, tìm kiếm, bộ lọc dùng chung, danh sách và panel; triển khai năm mục đang hiện. Nguồn chỉ đọc dùng deep link thật. Thêm trạng thái dữ liệu và quyền theo vai trò.
4. Bổ sung tích hợp/DB cho hành động trực tiếp. Cuối cùng mới mở các route phân tích đã ẩn khi dữ liệu đủ.

Nghiệm thu bằng tác vụ: người dùng thấy việc quan trọng nhất trong vài giây; từ Tổng quan tới đúng bản ghi tối đa hai thao tác; mỗi chỉ số mở ra được danh sách giải thích nó; không có nút vô hiệu hoặc số liệu không rõ kỳ; dữ liệu chậm/lỗi được nhận biết; danh sách 0, 20 và 200 bản ghi đều dùng được; desktop và mobile không làm mất thao tác chính.

## 7. Hai quyết định cần người dùng trả lời

1. Web có được phép xử lý trực tiếp và ghi ngược về CRM/Gmail/Sheet/Calendar không, hay chỉ xem và mở bản ghi nguồn?
2. Tổng quan và quyền thao tác có khác nhau theo ADMIN, SALES, KETOAN, KHO, MARKETING không?

Giả định mặc định trong plan: mỗi vai trò thấy ưu tiên phù hợp; thao tác trực tiếp là mục tiêu, nhưng chỉ bật sau khi có API ghi và cơ chế đồng bộ xác thực.
