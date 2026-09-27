# CSKH — bố cục, nội dung và component

**Trạng thái UI thử 25/09/2026:** đã build cấu trúc đỏ–trắng với khối kết quả đậm, chart cơ cấu lượt theo nhân viên, danh sách và panel chi tiết. Chart dùng số lượt thật từ `getCareReport` và mỗi nhân viên trong legend dẫn tới bộ lọc tương ứng. Các yêu cầu bên dưới về số chính thức CRM, giờ hoạt động, export, phân trang và detail mobile riêng vẫn là đích triển khai, chưa được xem là hoàn thành.

## Wireframe desktop (>= 1200 px)

```text
┌ Sidebar ──────┬ Chăm sóc khách hàng             [‹] [24/09/2026] [›]            ┐
│ Tổng quan     │ Báo cáo ngày hôm qua / 24/09/2026                              │
│ CSKH active   ├────────────────────────────────┬───────────────────────────────┤
│ ...           │ 28 khách ghi nhận               │ Hoạt động theo nhân viên     │
│               │ [Chưa có số CRM để đối soát]     │ [donut 34 lượt]             │
│               │ 34 lượt · 6 nhân viên · nguồn    │ Tên NV · khách · lượt ↗ lọc  │
│               ├────────────────────────────────┴───────────────────────────────┤
│               │ Khách hàng đã chăm sóc       │ Chi tiết khách đã chọn       │
│               │ [Tìm khách] [Nhân viên ▾]   │ Tên, số lượt trong ngày      │
│               │ Hiển thị 28/28 khách         │ Hoạt động 1 · NV · nội dung  │
│               │ Khách A · NV · preview        │ Hoạt động 2 · NV · kết quả   │
│               │ Khách B · NV · preview        │ Giờ: chưa có nếu CRM thiếu  │
└───────────────┴──────────────────────────────┴─────────────────────────────────┘
```

`*` Chỉ hiện khi dữ liệu/chức năng thực sự hỗ trợ. Badge “Đã đối soát” cần điều kiện trong `03-data-contract.md`. Nút export phải xuất thật. Nút CRM phải có link thật.

## Thứ bậc và chi tiết vùng

### 1. Header

- H1 “Chăm sóc khách hàng”. Dòng phụ “Báo cáo ngày hôm qua · 24/09/2026” khi ngày đang chọn là hôm qua; với ngày lịch sử: “Báo cáo ngày 20/09/2026”.
- Bộ chọn ngày có nút trước/sau, input lịch, không cho chọn ngày tương lai. Ngày được giữ trong URL. Với ngày hiện tại, nếu cho xem thì ghi “Dữ liệu trong ngày, chưa hoàn tất” và không gắn nhãn “báo cáo hôm qua”. V1 có thể khóa ở hôm qua/trước đó.
- Metadata cạnh summary: “Nguồn: CRM Incomsoft · Lấy lúc DD/MM/YYYY HH:mm”. Nếu chưa lấy, ghi “Chưa đồng bộ”.
- CTA duy nhất ở header là “Xuất báo cáo” dạng secondary khi xuất khả dụng; trang này chủ yếu để đọc, không cần nút primary giả.

### 2. Khối kết quả ngày

Khối liền mạch, không bốn stat-card ngang nhau. Số **khách theo CRM** là lớn nhất; bên dưới là badge đối soát. Bên cạnh lần lượt “Lượt chăm sóc” (tổng activity hợp lệ trong ngày) và “Nhân viên tham gia” (nhân viên có ít nhất 1 activity hợp lệ). Giá trị nào không có thì hiển thị `—` + lý do, không dùng 0.

Nếu nguồn chỉ có snapshot cục bộ cũ, label phải là “Khách ghi nhận trên dashboard”, không phải “Theo CRM”; không có badge đối soát. Chênh lệch hiển thị thành thông báo ngắn ngay dưới khối, kèm link đến danh sách lỗi.

### 3. Danh sách khách (phần chính, khoảng 60–65%)

- Tiêu đề “Khách hàng đã chăm sóc”. Công cụ: tìm tên/mã khách, filter nhân viên; “Hiển thị X/Y khách” phản ánh filter.
- Một dòng = **một khách duy nhất trong ngày**, không phải một activity. Thứ tự mặc định: giờ chăm sóc mới nhất giảm dần, tiebreak theo tên; người dùng có thể đổi sang tên A–Z. Nếu chưa có giờ chuẩn thì thứ tự theo tên và không hiển thị giờ đoán.
- Dòng: avatar chữ cái hoặc icon doanh nghiệp (không ảnh giả), tên khách đậm, số lượt nếu >1, danh sách nhân viên liên quan (nếu nhiều, “Minh Anh +1”), giờ mới nhất, preview nội dung/kết quả 1 dòng. Dòng chọn có nền `--surface-soft`, viền/indicator đỏ; toàn dòng dùng được bằng chuột và bàn phím.
- 0–20 khách: list thường. Trên 20: phân trang hoặc tải thêm; không cắt danh sách mà không báo. 200 khách vẫn tìm/lọc được mà không đơ. Số tổng ở header không lệ thuộc số dòng đã load.
- Không hiển thị `Customer.status` dưới nhãn “trạng thái chăm sóc”.

### 4. Panel chi tiết (khoảng 35–40%)

- Header tên khách, mã CRM nếu có, số lượt trong ngày và link CRM nếu có. Không hiển thị số điện thoại khi nghiệp vụ không yêu cầu hoặc quyền không cho phép.
- Timeline activity theo giờ tăng dần; mỗi item có **giờ thực tế**, nhân viên, phân loại/tiêu đề nếu nguồn có, nội dung và kết quả nguyên văn, tình trạng hoạt động nếu nguồn có. Nếu chỉ có ngày mà thiếu giờ: “Chưa có giờ” và thứ tự nguồn, không dựng 09:18.
- Dòng dài có line break hợp lý; không cắt nội dung trong panel. Không biến văn bản ghi chú thành badge status.
- Nếu danh sách có khách nhưng chi tiết lấy lỗi, panel báo lỗi riêng cho khách này; phần còn lại của báo cáo vẫn xem được.

### 5. Chart theo nhân viên

Hiển thị cạnh khối kết quả ngày. Donut biểu thị tỷ trọng **số lượt** theo nhân viên; legend có số lượt và số khách riêng biệt. Nhấn tên nhân viên để lọc danh sách bên dưới. Tối đa 5 nhân viên có nhiều lượt nhất được hiện riêng trên chart, phần còn lại gom “Nhân viên khác”; filter vẫn liệt kê đủ tất cả. Không cộng số khách của từng nhân viên thành tổng khách toàn ngày vì một khách có thể được nhiều người chăm sóc.

## Responsive

| Viewport | Cách xếp | Luồng detail |
|---|---|---|
| >=1200 px | Sidebar + header/summary + list-detail cạnh nhau | Panel phải, giữ selection khi filter hợp lệ |
| 768–1199 px | Sidebar gọn; list khoảng 55%, panel 45%; filter wrap | Vẫn cạnh nhau khi đủ rộng, giảm metadata phụ |
| <768 px | Header ngày, summary, công cụ, list một cột; theo nhân viên cuối trang | Chạm khách mở màn detail riêng/drawer toàn màn, có “Quay lại danh sách” |

Không dùng bảng 5 cột cuộn ngang trên mobile. Ở 1366×768 phải thấy ngày, trạng thái đối soát, search và ít nhất vài khách đầu mà không phải cuộn qua vùng trang trí.

## Component dự kiến

`CareReportHeader`, `CareDaySummary`, `ReconciliationNotice`, `CareCustomerFilters`, `CareCustomerList`, `CareCustomerRow`, `CareCustomerDetail`, `CareActivityTimeline`, `CareStaffSummary`, `CareEmptyState`. Tên là gợi ý để chia trách nhiệm, không buộc tạo component nếu chỉ dùng một chỗ và việc tách làm code phức tạp hơn.
