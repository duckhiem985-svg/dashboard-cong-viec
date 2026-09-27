# CSKH — kế hoạch triển khai có thể giao việc

Tài liệu này chia việc theo phụ thuộc để người execute không phải tự suy lại nghĩa dữ liệu. **UI đỏ–trắng đã được build thử ở local; contract CRM/snapshot và deploy chưa thực hiện theo spec này.** Không bật trạng thái “đã đối soát” trước phase dữ liệu.

## Phase 0 — xác nhận khả năng lấy nguồn (bắt buộc trước code dữ liệu)

1. Kiểm tra trực tiếp CRM `Customer_Cares`: số tổng hợp có đúng là distinct customer trong ngày không; danh sách có phân trang không; có source customer ID và activity ID ổn định không; tab Hoạt động trả giờ bắt đầu hay giờ hoàn thành; giờ nào phải báo cáo; employee có ID không.
2. Xác nhận chu trình schedule: giờ chạy hằng ngày, cách retry, quyền truy cập CRM, trạng thái khi một khách detail lỗi, dữ liệu late entry. Không copy key hiện tại sang repo/spec/log.
3. Chốt mẫu 3 ngày thật để kiểm tra: ngày có nhiều khách/nhiều lượt, Chủ nhật 0, ngày thường 0 hoặc dữ liệu lỗi. Chỉ lấy metadata/anonymized fixture nếu không được chia sẻ dữ liệu cá nhân.
4. Ghi lại kết quả trong `cskh/source-audit.md` khi thực hiện. Nếu CRM không có stable activity ID, chốt fingerprint fallback và mức giới hạn độ tin cậy trước migration.

**Xong khi:** định nghĩa số chính thức, ID, timestamp, phân trang và điều kiện complete được xác nhận từ nguồn. Các mục chưa biết phải ghi rõ, không tự đoán.

## Phase 1 — contract, schema, ingest

1. Viết schema/migration cho report run + customer trong run + activity, unique theo source ID và run/date; giữ dữ liệu cũ, có đường tương thích cho endpoint cũ trong giai đoạn chuyển tiếp. File chính: `prisma/schema.prisma`, migration tương ứng.
2. Tách parser/validator của snapshot v2. Bắt buộc `reportDate`, count, trạng thái run, ID khách; validate timezone/ngày/duplicate, giới hạn kích thước payload. File dự kiến: `src/lib/care-ingest.ts` hoặc tương đương.
3. Nâng `src/app/api/ingest/care/route.ts`: auth hiện có, transaction/idempotency, lỗi trả về có ý nghĩa, nhận 0 khách với ngày xác định; partial run không ghi đè bản complete. Không tạo `CareLog` trùng khi schedule chạy lại.
4. Sửa schedule/browser extraction để gửi official count và toàn bộ khách + activity + trạng thái từng khách. Đây là phần tích hợp ngoài repo nếu schedule ở nơi khác; phải lưu spec contract từ file `03-data-contract.md` cho người vận hành.
5. Kiểm tra riêng dữ liệu ngày/hours theo `Asia/Ho_Chi_Minh`; nhiều activity của một khách; hai khách cùng tên; chạy lại cùng payload; run mới sau late entry; partial failure; Chủ nhật 0.

**Xong khi:** API có thể lưu snapshot ngày và trả về report đối soát đúng mà không nhân bản hoặc mất bản complete trước đó.

## Phase 2 — lớp đọc dữ liệu báo cáo

1. Thay `getCareDates/getCareDay` trong `src/lib/care.ts` bằng query theo reportDate và bản run công bố; không dùng UTC boundary của `CareLog.date` làm ngày nghiệp vụ.
2. Trả model hiển thị gồm `official`, `listed`, `detailed`, `activities`, `employees`, `reconciliationState`, `fetchedAt`, `customers[]`, `staff[]`, `errors[]`. Tính per-staff distinct bằng source ID; không sum per-staff thành tổng ngày.
3. Quy định fallback legacy: có thể hiển thị “Dữ liệu dashboard cũ, chưa đối soát” nếu ngày chỉ có `CareLog`; không nâng nó thành report CRM verified.
4. Kiểm tra query trên 0, 1, 20, 200 khách và ngày có nhiều activity; phân trang hoặc giới hạn hợp lý không làm sai tổng.

**Xong khi:** lớp đọc có trạng thái rõ cho mọi ngày, kể cả ngày không có run và ngày 0 đã xác minh.

## Phase 3 — UI đỏ–trắng

1. Tạo token dùng chung ở `src/app/globals.css` theo `shared/visual-system.md`; cập nhật shell `src/components/Sidebar.tsx` và dashboard layout nếu quyết định áp dụng hệ mới toàn app. Tránh trang CSKH đỏ–trắng nhưng shell vẫn cam/be từ redesign cũ. Kiểm tra regression trang còn lại vì token global ảnh hưởng chúng.
2. Thay `src/app/(dashboard)/customers/page.tsx` bằng hierarchy trong `02-screen-spec.md`; chia component khi có lợi. Route nhận ngày từ searchParams, mặc định hôm qua giờ Việt Nam.
3. Làm summary/notice trước, sau đó search/filter/list, cuối cùng panel timeline + staff breakdown. Mỗi nút phải có chức năng thật. Nếu export hoặc CRM link chưa có, không vẽ nút.
4. Chốt desktop 1366×768, 1440×900 và mobile 390×844; list/detail responsive, long name/long note, 200% zoom, keyboard/focus.
5. Fixture chỉ trong dev/test và ghi rõ “Dữ liệu minh họa”; production luôn đọc trạng thái thật từ server.

**Xong khi:** người dùng mở CSKH thấy ngày, số/độ tin cậy, danh sách và chi tiết theo đúng luồng, không cần đọc bảng log ngang kiểu Excel.

## Phase 4 — export, kiểm tra và release

1. Nếu cần export trong V1, triển khai endpoint/format theo đúng dữ liệu và quyền xem; kiểm tra số trong file bằng summary UI. Nếu chưa làm, xóa CTA khỏi UI.
2. Kiểm tra auth/permissions cho page, API dữ liệu và export; dữ liệu không bị lộ qua preview hoặc URL. Kiểm tra thông tin nhạy cảm không xuất hiện trong log.
3. Chạy lint/build và các test có ý nghĩa: hợp đồng ingest/idempotency, timezone, đối soát, zero states, multi-employee, partial run; test giao diện thao tác chính trên desktop/mobile.
4. Review với 3 báo cáo thật hoặc ẩn danh hóa (ngày thường, nhiều activity, Chủ nhật 0), so trực tiếp với tổng hợp CRM. Release/deploy sau khi giao diện và số liệu được duyệt.

## Tiêu chí nghiệm thu từ góc nhìn người dùng

- Mở trang thấy **đúng ngày hôm qua** theo giờ Việt Nam, kể cả khi ngày gần nhất có dữ liệu là ngày khác.
- Trong vài giây phân biệt được: tổng CRM, số khách danh sách, số lượt, trạng thái khớp/chưa khớp và giờ lấy.
- Một khách có 2 activity chỉ xuất hiện 1 lần trong list, có cả 2 activity ở panel với đúng nhân viên/giờ/nội dung.
- Một khách được 2 nhân viên chăm sóc không làm tổng khách ngày tăng đôi; cả hai nhân viên được ghi trong thống kê riêng.
- Chủ nhật 0 không báo lỗi; ngày thường 0 chưa xác minh không bị hiểu là kết quả chắc chắn; không có run không hiển thị 0.
- Run lặp không sinh trùng; run partial không xóa report complete; dữ liệu đến muộn có as-of mới và trạng thái đúng.
- Search/filter không đổi tổng chính thức. Long note, 200 khách, mobile và bàn phím đều dùng được.
- Không có nút chết, số giả, badge xác minh khi thiếu nguồn hoặc status mượn từ `Customer.status`.

## Phần cần phía người dùng/nguồn xác nhận trước Phase 1

1. CRM có cung cấp ID khách, ID activity và giờ chính xác qua UI/API không? Nếu không, cần duyệt cơ chế fallback và giới hạn độ tin cậy.
2. Có được sửa schedule thu thập để gửi snapshot v2 không, và schedule đang được quản lý ở đâu?
3. Quyền xem: mọi tài khoản dashboard xem toàn bộ nội dung chăm sóc hay theo vai trò/nhân viên?
4. Export có cần ngay trong V1 không; nếu cần, muốn file Excel hay CSV và dữ liệu toàn ngày hay theo filter?

Các câu trả lời này không cản việc review bố cục/spec, nhưng quyết định cách code và điều kiện bật tính năng.
