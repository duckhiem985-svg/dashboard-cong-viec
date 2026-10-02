# Kế hoạch thiết kế lại UI mobile

**Phạm vi:** 5 mục đang hiện trong menu (`/`, `/customers`, `/debt`, `/email`, `/calendar`) và đăng nhập. Các route phân tích đang ẩn không nằm trong đợt này. Đây là plan UI/UX, chưa phải quyết định thay đổi dữ liệu hay API.

**Prototype để thử luồng:** [mobile-ui-simulation.html](../design-demos/mobile-ui-simulation.html). Toàn bộ số, tên khách và nội dung trong prototype là dữ liệu minh hoạ; bản này không kết nối database.

## 1. Cách đọc brief và đánh giá hiện trạng

Đây là công cụ nội bộ cho người quản lý đọc nhanh báo cáo ngày và nhân viên tra cứu công việc. Ngôn ngữ thị giác đã chốt là **đỏ, trắng, chữ rõ, số có ngữ cảnh**. Mức đề xuất theo `design-taste-frontend`: biến thiên 4/10, chuyển động 2/10, mật độ 6/10. Giữ Geist và hệ màu hiện có; bỏ hero kiểu marketing, card chỉ để nhóm nội dung có ý nghĩa. Skill taste tự giới hạn ngoài dashboard, vì vậy áp dụng phần audit, nhịp trình bày, tính nhất quán và chống UI rập khuôn; quyết định về dữ liệu và tương tác theo `saas-dashboard-design` và `mobile-first-design`.

**Bằng chứng browser ở production, 02/10/2026:**

- 360px: shell còn cột sidebar 224px, main khoảng 136px, chữ và chart vỡ. CSS `.dashboard-shell.dashboard-shell` thắng media query `.dashboard-shell` ở `shell.css`.
- Sau khi tạm sửa shell chỉ trong browser: trang CSKH đọc được nhưng 54 khách tạo danh sách hơn 4.000px. Chọn khách nhảy tới detail cuối trang; trở lại danh sách nhảy về đầu.
- 320px: cụm chọn ngày tràn ngang khoảng 29px. Nút “Xem ngày” xuống dòng; ngày trong native input hiển thị theo locale khác với tiêu đề `dd/MM/yyyy`.
- Menu ngang bị cắt mục bên trái. Danh sách khách mobile chỉ còn tên và nhân viên vì preview note bị ẩn.
- Code các trang Công nợ và Email vẫn dùng bảng nhiều cột. Đây là rủi ro mobile từ code, chưa được kiểm tra trực tiếp bằng browser trong lượt audit trên.

## 2. Nguyên tắc chung cho mobile

1. **Một màn, một việc chính.** Phần đầu trả lời “đang xem ngày/kỳ nào, dữ liệu tin đến đâu, cần mở gì tiếp”. Không lặp một số ở hero, card và chart.
2. **Không cuộn ngang để đọc dữ liệu chính.** Bảng desktop chuyển thành danh sách có thứ bậc nội dung trên mobile; bảng chỉ là chế độ desktop hoặc xuất dữ liệu.
3. **Chi tiết là màn riêng trên mobile.** Khi quay lại giữ ngày, bộ lọc, từ khóa và vị trí cuộn. URL chi tiết mở trực tiếp được.
4. **Điều hướng luôn nhìn thấy.** Header gọn với tên trang và tài khoản; thanh đáy gồm Tổng quan, CSKH, Công nợ, Email, Lịch, có icon và nhãn. Không dùng menu cuộn ngang bị cắt. Chừa safe area iPhone và khoảng trống cuối nội dung.
5. **Đỏ là màu nhấn.** Nền trắng/nhạt cho nội dung, đỏ cho mục đang chọn hoặc hành động chính. Dùng chữ và icon kèm màu cho cảnh báo/trạng thái. Thống nhất card 12–16px, control 8–10px, badge pill.
6. **Dữ liệu trung thực.** Mỗi số có đơn vị, kỳ, nguồn, thời điểm cập nhật. Phân biệt “0”, “chưa đồng bộ”, “nguồn lỗi”, “không có kết quả lọc”. Không tạo trạng thái hoặc CTA nghiệp vụ khi nguồn chưa hỗ trợ.
7. **Thao tác chạm rõ ràng.** Vùng nhấn tối thiểu 44px; body chính 14–16px; nhãn phụ ít nhất 12px và đủ tương phản. Có focus, loading, retry, empty, stale, error; không dựa vào hover.

## 3. Khung chung và đăng nhập

### Shell

- **Màn đầu:** header cao khoảng 56–64px; tên doanh nghiệp rút gọn ở mobile, tên trang rõ; tài khoản/đăng xuất nằm trong menu riêng. Thanh đáy cố định gồm 5 mục đang hiển thị. Nội dung có padding 16px và không bị thanh đáy che.
- **Tablet:** chuyển sang rail/sidebar khi đủ chỗ cho nội dung tối thiểu; breakpoint dựa trên độ rộng thực của content, không chỉ con số thiết bị.
- **Trạng thái:** nhãn đang chọn khác biệt bằng màu + nền/biểu tượng; menu vẫn dùng được ở 320px và zoom 200%.
- **Ưu tiên sửa code đầu tiên:** gỡ xung đột specificity của grid shell; sau đó đo `scrollWidth <= viewport width` cho mọi route.

### Đăng nhập

- Đưa form lên trong viewport đầu: tên sản phẩm một dòng/ngắn, mô tả một câu; bỏ hero 422px trên 360px. Hai field, lỗi ngay dưới field hoặc form, nút Đăng nhập rộng toàn hàng.
- Giữ quy tắc tên đăng nhập không có dấu cách; hướng dẫn hiển thị gần field. Khi bàn phím mở, nút submit vẫn tới được, không bị che. Không thêm “ghi nhớ mật khẩu” nếu sản phẩm chưa có.

## 4. Từng trang đang dùng

### 4.1 Tổng quan `/`

**Câu hỏi:** Hôm qua báo cáo CSKH ra sao và các nguồn công việc có gì mới?

**Thứ tự mobile:** ngày/kỳ + trạng thái đồng bộ → một khối CSKH ngày gần nhất có nguồn và link vào đúng ngày → tối đa hai đường tắt có thông tin thật (lịch sắp tới, email mới) → số tổng lịch sử trong mục “Xem thêm”. Bỏ câu hero lớn và 4 ô số xếp dọc trước nội dung hữu ích. Không gọi số lịch sử là “hôm nay”.

**Tương tác:** chạm khối CSKH mở đúng báo cáo ngày; chạm email mở bản ghi trong app nếu có detail, còn chưa thì vào danh sách Email. Từng nguồn có thời điểm cập nhật riêng.

**Cần dữ liệu nếu muốn “việc cần xử lý”:** quy tắc ưu tiên đã duyệt, hạn xử lý, trạng thái và người phụ trách. Chưa có thì chỉ trình bày **tóm tắt**, không tạo hàng chờ giả.

### 4.2 CSKH `/customers` — ưu tiên thiết kế số 1

**Câu hỏi đã chốt:** Hôm qua bao nhiêu khách được ghi nhận, số có đáng tin không, ai được chăm sóc, nội dung từng lượt là gì?

**Màn danh sách:** header “CSKH · Hôm qua, dd/MM” + nút đổi ngày gọn → số khách chính và trạng thái đối soát ngắn → dòng phụ số lượt, số nhân viên, nguồn/as-of → hai tab `Khách hàng` (mặc định) và `Theo nhân viên`. Tìm tên và lọc nhân viên nằm ngay trên danh sách. Chart nằm trong tab Theo nhân viên để không đẩy tác vụ tra cứu xuống dưới.

**Dòng khách:** tên tối đa 2 dòng, nhân viên và số lượt; preview một dòng nội dung thật nếu có, nhãn “Chưa có nội dung” nếu thiếu. Không suy từ note sang nhãn “Đã chốt”, “Cần gọi”, “Ưu tiên”. Dùng tải thêm 20 khách hoặc phân trang, giữ count `N/M`; không đổ 54–200 dòng một lần vào chiều cao trang.

**Màn chi tiết:** header có nút Quay lại danh sách, tên đầy đủ, ngày; timeline từng lượt với nhân viên, nội dung gốc, giờ thật nếu nguồn có. Khi quay lại giữ vị trí cuộn và filter. Deep link `date` + `customer` hoạt động khi mở mới trang. Nếu customer không thuộc ngày/filter, báo rõ và có lối về danh sách.

**Theo nhân viên:** ưu tiên danh sách xếp theo lượt/khách, thanh tỷ lệ ngắn có nhãn; donut chỉ giữ khi vẫn giải thích tốt ở 320px. Chạm nhân viên chuyển về tab khách đã lọc. Không diễn giải lượt là năng suất/chất lượng.

**Trạng thái:** ngày chưa có run khác với ngày xác nhận 0; thiếu official count hiện “chưa đối soát”; partial run/lỗi nguồn có thông báo và dữ liệu as-of. Tên dài, 0/20/200 khách, khách nhiều nhân viên và nhiều lượt đều phải dùng được.

**Data gate:** official count và ID khách CRM cho badge đối soát; activity time/ID và extraction status cho timeline tin cậy. Các mục này đã được mô tả trong `cskh/03-data-contract.md`, chưa được coi là đã có.

### 4.3 Công nợ `/debt`

**Câu hỏi hiện đáp ứng được:** tổng dư nợ, khách nào có số dư lớn, ghi chú là gì. **Chưa gọi là “quá hạn”** nếu hạn thanh toán không đáng tin.

**Thứ tự mobile:** tổng công nợ kèm thời điểm đồng bộ → tìm khách và sắp xếp theo số tiền/tên → danh sách mỗi khách: tên 2 dòng, số tiền nổi bật, tỷ trọng hoặc ghi chú ngắn. Chạm mở chi tiết trong app để xem ghi chú đầy đủ; nếu chưa có dữ liệu chi tiết mới, màn này chỉ là bản mở rộng của record hiện có. Không bắt người dùng kéo ngang bảng 5 cột.

**Cần thêm để có bộ lọc Quá hạn/Đến hạn:** invoice/record ID, hạn, số đã thu, kỳ đối soát, lịch sử thanh toán và trạng thái nguồn. Không đặt nút “Đã thu” trước khi có luồng ghi và quyền.

### 4.4 Email `/email`

**Câu hỏi:** Email nào đến gần đây, từ ai, nội dung tóm tắt là gì?

**Thứ tự mobile:** ngày cập nhật + nguồn → tìm theo người gửi/tiêu đề → danh sách theo ngày. Mỗi item có sender, subject tối đa 2 dòng, giờ/ngày, category dạng chữ nhỏ. Chạm mở detail để đọc summary hiện có; không ép 4 cột vào 320px.

**Không gắn nhãn “Chưa trả lời” hay nút “Trả lời”** khi chưa có thread ID/trạng thái trả lời/đường dẫn Gmail. Cần source message/thread ID, snippet/body an toàn và trạng thái nếu muốn inbox có hàng chờ.

### 4.5 Lịch `/calendar`

**Câu hỏi:** Việc hoặc sự kiện sắp tới nào cần xem, lúc mấy giờ?

**Thứ tự mobile:** nhóm `Hôm nay`, `Ngày mai`, `Sau đó`; mỗi dòng giờ, tiêu đề 2 dòng, trạng thái và loại nếu dữ liệu có. Các số “sắp tới/chưa xong/đã xong” thu gọn vào một dải, không đẩy lịch xuống. Chạm mở detail có nội dung đầy đủ; checkbox phải có vùng nhấn 44px.

**Trung thực đồng bộ:** hiện checkbox ghi vào DB dashboard; cần ghi “đánh dấu trên dashboard” cho đến khi xác nhận ghi ngược Google Calendar. Cần loại việc/sự kiện, giờ kết thúc, all-day, timezone, link nguồn, owner để bật các tương tác tương ứng.

## 5. Thứ tự thực hiện

| Đợt | Việc | Tiêu chí hoàn thành |
|---|---|---|
| P0 | Sửa shell và tràn ngang; header + thanh điều hướng mobile; chỉnh login | 320/360/390/430px không bị cắt nội dung chính, không cuộn ngang toàn trang; form đăng nhập thấy và dùng được khi bật bàn phím |
| P1 | CSKH mobile danh sách → chi tiết riêng; đổi ngày/filter; tab nhân viên | Mở 1 trong 200 khách, đọc detail, quay lại đúng vị trí và filter; link trực tiếp vào khách dùng được; 0 và lỗi nguồn không bị hiểu là kết quả 0 |
| P2 | Tổng quan theo ngày/kỳ và độ tin cậy dữ liệu | Trong viewport đầu thấy ngày, số chính và nguồn; mọi số tổng lịch sử có nhãn kỳ; đường dẫn đưa tới đúng báo cáo |
| P3 | Công nợ, Email, Lịch chuyển bảng/list và detail phù hợp mobile | Không cần cuộn ngang; mở được nội dung dài; không có CTA không hoạt động hoặc trạng thái bịa |
| P4 | Rà thị giác, accessibility và thiết bị thực | Typography, spacing, radius, icon và màu nhất quán; target >=44px; focus/contrast; kiểm tra Safari iPhone, Chrome Android, zoom 200%, bàn phím, mạng chậm |

## 6. Những quyết định dữ liệu cần chốt trước khi nâng cấp nghiệp vụ

1. Vai trò nào xem được chi tiết khách, công nợ và email? Có cần khác nhau giữa ADMIN/SALES/KETOAN không?
2. Dashboard chỉ đọc nguồn hay được ghi ngược CRM/Gmail/Calendar? Cho đến khi rõ, UI chỉ có hành động xem/tra cứu thật.
3. Có lấy được official count, ID khách, ID hoạt động, giờ chăm sóc và kết quả trích xuất per customer từ CRM không? Nếu chưa, UI báo “chưa đối soát”, không hiển thị badge xác nhận.
4. Công nợ có hạn thanh toán và lịch sử thu đáng tin không? Email có ID/thread/trạng thái không? Lịch có loại item và URL nguồn không? Chỉ bật bộ lọc/trạng thái tương ứng sau khi có dữ liệu.

## 7. Cách nghiệm thu với người dùng

Cho người quản lý mở mobile và thực hiện 3 tác vụ: (1) biết số khách hôm qua và mức tin cậy trong vài giây; (2) tìm một khách, đọc nội dung, quay lại tìm khách tiếp theo; (3) xem khoản nợ/email/lịch mà không cần xoay điện thoại hay cuộn ngang. Quan sát số lần chạm, cuộn, chỗ đọc nhầm ngày/trạng thái và khả năng tự tìm đường quay lại. Nếu một màn không giúp trả lời câu hỏi nghiệp vụ của nó, bỏ hoặc hạ cấp thành thông tin phụ.
