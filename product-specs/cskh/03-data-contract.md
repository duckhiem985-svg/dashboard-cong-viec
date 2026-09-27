# CSKH — hợp đồng dữ liệu và phép đối soát

## Nguồn và đơn vị đếm

`reportDate` là ngày làm việc của CRM ở múi giờ `Asia/Ho_Chi_Minh` (`YYYY-MM-DD`). `fetchedAt` là thời điểm dashboard nhận/xác nhận snapshot; activity time là thời điểm hoạt động thực tế. Không dùng `fetchedAt` thay activity time.

| Chỉ số | Định nghĩa | Nguồn | Điều kiện hiển thị |
|---|---|---|---|
| Khách theo CRM | Số khách “đã chăm sóc” trong bảng “Tổng hợp kết quả Chăm sóc” cho đúng ngày | CRM official count | Có run đọc thành công và trường count |
| Khách trong danh sách | Số `sourceCustomerId` khác nhau được trích xuất từ kết quả ngày; fallback tên chỉ là tạm và không đủ xác minh | Danh sách CRM | Có danh sách được lấy thành công |
| Lượt chăm sóc | Số `sourceActivityId` khác nhau thuộc ngày báo cáo | Tab Hoạt động từng khách | Chỉ đếm activity đã lấy và xác thực ngày |
| Nhân viên tham gia | Số `sourceEmployeeId` khác nhau trong các activity hợp lệ | Activity | Có đủ actor/employee |
| Theo nhân viên | Distinct `sourceCustomerId` cho mỗi `sourceEmployeeId`, cộng lượt riêng | Activity | Có đủ ID nguồn; tổng các nhân viên có thể > tổng khách |
| Chi tiết đủ | Số khách trong danh sách mà việc lấy tab Hoạt động đã thành công và dữ liệu trong ngày đã được kiểm tra | Extraction result | Có kết quả per-customer, kể cả 0 activity phải là trạng thái riêng cần xét |

## Contract snapshot đề xuất (phiên bản mới)

Payload là **một snapshot trọn vẹn của một ngày**, gửi một lần sau khi thu thập. Trường `entry` hiện tại chỉ có tên/nhân viên/note/date không đủ. Ví dụ dưới là cấu trúc, không phải dữ liệu thật:

```json
{
  "schemaVersion": 2,
  "source": "incomsoft_customer_cares",
  "reportDate": "2026-09-24",
  "timezone": "Asia/Ho_Chi_Minh",
  "officialCustomerCount": 28,
  "sourceFilterVerified": true,
  "extractionStatus": "complete",
  "customers": [
    {
      "sourceCustomerId": "crm-customer-id",
      "name": "Công ty An Phát",
      "sourceUrl": null,
      "activityExtractionStatus": "complete",
      "activities": [
        {
          "sourceActivityId": "crm-activity-id",
          "sourceEmployeeId": "crm-employee-id",
          "employeeName": "Minh Anh",
          "occurredAt": "2026-09-24T09:18:00+07:00",
          "activityStatus": "Hoàn tất",
          "category": "Gọi điện",
          "title": "Cập nhật tiến độ",
          "content": "Trao đổi về tiến độ giao hàng",
          "result": "Khách đồng ý lịch dự kiến"
        }
      ]
    }
  ]
}
```

`sourceActivityId`/`sourceEmployeeId` là mục tiêu cần lấy từ CRM; phải khảo sát CRM thực tế để xác nhận có thể lấy. Nếu thiếu activity ID, có thể dùng fingerprint dự phòng (`sourceCustomerId + occurredAt + employee + nội dung`) cho dedupe nhưng đánh dấu độ tin cậy thấp vì bản ghi sửa nội dung có thể đổi fingerprint. Không dùng tên khách làm khóa nhận dạng khi có ID nguồn. `sourceUrl` chỉ gửi/lưu nếu đường dẫn an toàn và được phép chia sẻ trong app; không đưa href/id nhạy cảm vào log hoặc tài liệu.

Nếu extractor không lấy đủ toàn bộ khách, `extractionStatus = partial`, trả danh sách lỗi per customer và giữ run trước làm bản công bố nếu cần. Không khai báo `complete` chỉ vì POST thành công. Nếu ngày không có khách, `customers: []` **vẫn phải có** `reportDate`, `officialCustomerCount: 0`, `sourceFilterVerified` và metadata run. Payload cũ `{ "entries": [] }` chỉ ghi giờ sync, không chứng minh ngày nào bằng 0.

## Phép đối soát và trạng thái

Tính `listed = count(distinct sourceCustomerId)`, `detailed = số khách lấy detail thành công`, `official = officialCustomerCount`.

| Điều kiện | Trạng thái UI |
|---|---|
| Không có run cho ngày | `Chưa lấy dữ liệu` |
| Run lỗi/partial hoặc thiếu official count | `Chưa đủ dữ liệu để đối soát` |
| `listed != official` | `Cần kiểm tra · listed/official khách` |
| `listed == official` nhưng `detailed < listed`, lỗi parse, ID khách trùng/thiếu, hoặc activity không xác định ngày | `Danh sách khớp · chi tiết chưa đủ` |
| `listed == official`, mọi detail thành công, không lỗi validation, snapshot complete | `Đã đối soát official/official khách` |

Với `official = 0`, chỉ chấp nhận “0 đã đối soát” khi run thành công và filter được xác minh. Chủ nhật 0 hiển thị trạng thái bình thường + giải thích công ty nghỉ. Ngày thường 0 dù filter đã xác minh vẫn ghi nguồn 0 và có thể cần xác minh việc nhập liệu, không biến thành tín hiệu “mọi nhân viên đã hoàn thành”.

## Lưu trữ và xử lý lại

- Đề xuất entity `CareReportRun` theo `source + reportDate + runId` chứa official count, filter verified, extraction status, fetchedAt, lỗi và số đếm thực tế. `CareReportCustomer` theo run + sourceCustomerId, có trạng thái lấy detail; `CareActivity` theo sourceActivityId, quan hệ tới khách và run/ngày, thời gian + nội dung. Cân nhắc reuse `Customer`/`CareLog` nhưng không phá dữ liệu cũ.
- Ingest validate body, giới hạn kích thước/bản ghi, parse ngày và timezone; giao dịch nguyên tử cho snapshot complete. Nhận cùng run hai lần không tạo bản ghi trùng. Run mới cùng ngày thay phiên bản công bố của ngày một cách có kiểm soát, không cộng dồn activity cũ và mới.
- Partial run không xóa snapshot complete trước đó; UI hiển thị bản được công bố và thông báo lần refresh gần nhất gặp lỗi. Lịch sử run lưu để truy vết số thay đổi do nhập liệu trễ.
- Các hoạt động cùng khách trong ngày giữ tất cả. Phân biệt `customerId`, `activityId`, `employeeId`; một khách có thể có nhiều nhân viên và nhiều lượt.
- Không lưu key ingest trong spec, frontend, fixture hoặc ảnh demo. Key hiện có trong yêu cầu được dán là bí mật vận hành, khi đổi contract cần quản lý qua env và cân nhắc rotate.

## Khoảng cách với code hiện tại

| Hiện có | Khoảng cách cần xử lý |
|---|---|
| `Customer`, `CareLog`, `SyncStatus` | Không có official count/run per day, trạng thái từng khách, ID hoạt động nguồn |
| `POST /api/ingest/care` nhận `entries` | Không có reportDate bắt buộc, giờ thực tế, ID nguồn, count; luôn `CareLog.create`, chạy lại sinh trùng |
| Ghép khách theo `name` | Tên trùng/đổi tên có thể ghép sai; cần ID CRM |
| `CareLog.date` hiện từ `YYYY-MM-DD` | Mất giờ trong activity; truy vấn UTC dễ lệch ngày nghiệp vụ |
| `getCareDates` distinct DateTime, `getCareDay` UTC day | Có thể trùng chip ngày và lệch ngày; cần group/filter theo reportDate địa phương |
| UI hiện dùng `Customer.status` như status của log | Sai nghĩa; bỏ khỏi dòng hoạt động |

**Gate dữ liệu tối thiểu để bật badge đối soát:** reportDate, official count, danh sách ID khách, kết quả lấy detail cho từng khách, run complete và thời điểm lấy. Giờ thực tế, ID activity/employee và nội dung cấu trúc cần cho timeline chính xác, dedupe và thống kê nhân viên đáng tin.
