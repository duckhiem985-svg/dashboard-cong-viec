# Product specs — Dashboard Bao Bì Giấy Toàn Quốc

Folder này là nguồn đặc tả để triển khai lại từng trang. Hiện mới **chốt CSKH**; các trang còn lại sẽ có thư mục riêng khi được phân tích. Đây là tài liệu, chưa phải thay đổi UI hay API.

[Kế hoạch UI mobile](mobile-ui-plan.md) đánh giá khung chung và 5 mục đang hiển thị, đồng thời chia thứ tự thực hiện. Phần CSKH vẫn tuân theo đặc tả trong `cskh/`.

## Cấu trúc

```text
product-specs/
├── README.md                         # Mục lục, quy ước và thứ tự ưu tiên
├── shared/
│   ├── visual-system.md              # Màu đỏ–trắng, type, spacing, layout, controls
│   └── page-spec-template.md         # Mẫu bắt buộc cho những trang kế tiếp
└── cskh/
    ├── README.md                     # Mục tiêu, phạm vi, nguồn và điều đã chốt
    ├── 01-user-flow.md               # Vai trò, câu hỏi, luồng xem báo cáo
    ├── 02-screen-spec.md             # Wireframe chữ, thứ bậc, từng khối, responsive
    ├── 03-data-contract.md           # Định nghĩa số liệu, ingest, đối soát, dữ liệu thiếu
    ├── 04-states-and-interactions.md  # Bộ lọc, tương tác, lỗi, zero state, accessibility
    └── 05-execution.md                # Công việc theo thứ tự, file map, nghiệm thu
```

## Quy tắc chung

- Mỗi trang trả lời câu hỏi nghiệp vụ cụ thể. Không thêm chỉ số, biểu đồ hay hành động chỉ để lấp chỗ trống.
- Số liệu thật phải có **nguồn, ngày nghiệp vụ, thời điểm lấy và định nghĩa đếm**. Mockup/fixture phải ghi rõ là dữ liệu minh họa.
- Không biến bản thiết kế thành cam kết dữ liệu: mục nào chưa có nguồn thì ghi “chưa có dữ liệu”, không suy diễn.
- Trang có thể triển khai theo giai đoạn nhưng điều kiện “đã đối soát/đã xác thực” chỉ bật khi đủ bằng chứng.
- Đặc tả `shared/` áp dụng cho tất cả trang. File trong từng trang mô tả ngoại lệ nghiệp vụ. Nếu khác nhau, yêu cầu người dùng chốt mới thay đổi quy tắc dùng chung.
- `REDESIGN_PLAN.md` ở root là bản brainstorm cũ; phần CSKH trong folder này thay thế mục CSKH của bản đó. Không lấy đề xuất “CRM workspace / cần liên hệ” cũ làm mục tiêu trang CSKH này.

## Khi thêm trang mới

Tạo `product-specs/<route-name>/` dựa trên [page-spec-template.md](shared/page-spec-template.md). Viết rõ nguồn dữ liệu hiện có, dữ liệu thiếu, trạng thái lỗi và tiêu chí nghiệm thu trước khi sửa code. Không lập thư mục rỗng cho trang chưa được phân tích.

## Trạng thái

| Trang | Spec | Thiết kế duyệt | Code | Dữ liệu đủ để đối soát |
|---|---|---|---|---|
| CSKH `/customers` | Bản đầu, chờ duyệt | UI đỏ–trắng đã build thử ở local | UI thử đã có; contract dữ liệu chưa nâng | Chưa |
| Tổng quan, Công nợ, Email, Lịch và các trang khác | Chưa tách spec | Chưa | Chưa theo hệ mới | Chưa đánh giá |

Không dùng ảnh demo có số `28/28` như bằng chứng dữ liệu thật. Số đó chỉ minh họa bố cục.
