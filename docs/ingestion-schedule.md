# Bước cuối dán vào 3 schedule (gửi số liệu về dashboard)

Dán NGUYÊN đoạn tương ứng vào CUỐI prompt của từng schedule. Các bước cũ giữ nguyên.
Không chia sẻ file này (có API key).

---

## 1. Bao cao cong no hang ngay

BƯỚC CUỐI — Gửi số liệu về dashboard (làm sau khi đã viết xong báo cáo):
Gửi 1 yêu cầu HTTP POST bằng công cụ mcp__remote-devices__device_bash (chạy lệnh curl trên máy Windows của chị, KHÔNG dùng Bash của môi trường cloud vì bị proxy chặn) tới
https://dashboard-cong-viec.vercel.app/api/ingest/debt
Header: x-api-key: <INGEST_API_KEY>   và   Content-Type: application/json
Body JSON: {"records":[{"customerName":"<tên khách>","amount":<công nợ cũ còn lại + công nợ mới phát sinh, số nguyên VNĐ>,"daysOverdue":0,"note":"<ghi chú ngắn, có thể để rỗng>"}]}
Chỉ đưa các khách có amount > 0, lấy ĐỦ toàn bộ khách trong sheet (không chỉ top 10), vì dashboard thay thế toàn bộ bảng công nợ bằng danh sách này. Nếu không đọc được sheet thì KHÔNG gửi. Kết quả đúng là {"ok":true,...}; nếu lỗi thì ghi rõ vào cuối báo cáo.

---

## 2. Bao cao cham soc kh hang ngay

BƯỚC CUỐI — Gửi số liệu về dashboard (làm sau bước 6):
Gửi HTTP POST bằng công cụ mcp__remote-devices__device_bash (chạy lệnh curl trên máy Windows của chị, KHÔNG dùng Bash của môi trường cloud vì bị proxy chặn) tới
https://dashboard-cong-viec.vercel.app/api/ingest/care
Header: x-api-key: <INGEST_API_KEY>   và   Content-Type: application/json
Body JSON: {"entries":[{"customerName":"<tên khách>","salesName":"<TÊN NHÂN VIÊN chăm sóc>","note":"<nội dung/kết quả chăm sóc>","date":"<YESTERDAY dạng yyyy-mm-dd>"}]}
Mỗi hoạt động chăm sóc là 1 phần tử. Nếu count = 0 hoặc Chủ nhật thì gửi {"entries":[]} (để dashboard ghi nhận giờ cập nhật). Nếu lỗi thì ghi rõ vào cuối báo cáo.

---

## 3. Bao cao google ads hang ngay

BƯỚC CUỐI — Gửi số liệu Google Ads về dashboard (làm sau khi viết báo cáo, chỉ phần Google Ads):
Gửi HTTP POST bằng công cụ mcp__remote-devices__device_bash (chạy lệnh curl trên máy Windows của chị, KHÔNG dùng Bash của môi trường cloud vì bị proxy chặn) tới
https://dashboard-cong-viec.vercel.app/api/ingest/ads
Header: x-api-key: <INGEST_API_KEY>   và   Content-Type: application/json
Body JSON: {"campaigns":[{"name":"<tên chiến dịch>","date":"<hôm qua dạng yyyy-mm-dd>","spend":<chi phí VNĐ>,"clicks":<click>,"impressions":<hiển thị>,"conversions":<chuyển đổi>}]}
Mỗi chiến dịch là 1 phần tử, chỉ dùng số đọc được thật (không đoán). Nếu không đọc được Google Ads thì KHÔNG gửi. Nếu lỗi thì ghi rõ vào cuối báo cáo.
