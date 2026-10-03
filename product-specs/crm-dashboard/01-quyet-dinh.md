# 01 — Các quyết định phải chốt trước khi code

Mỗi mục gồm: câu hỏi · vì sao quan trọng · các lựa chọn · **đề xuất** · ảnh hưởng nếu đổi ý về sau · chặn giai đoạn nào (xem [10-lo-trinh-trien-khai.md](10-lo-trinh-trien-khai.md)).

Ký hiệu người quyết: **[Client]** = chị Hiền / người dùng cuối; **[Chủ dự án]** = người làm dashboard (bạn).

Cách trả lời nhanh: ghi mã + lựa chọn, ví dụ `Q1: A, Q2: B, Q3: đồng ý đề xuất…`.

---

## Q1. Trang CSKH mới thay trang `/customers` hiện tại, hay đứng cạnh? [Client + Chủ dự án] — chặn GĐ1

**Vì sao quan trọng:** repo đang có trang `/customers` = báo cáo **từng ngày** (ai chăm sóc khách nào hôm qua), lấy từ module `Customer_Cares`. Spec mới = dashboard **quản trị theo kỳ** (khách bị bỏ sót, việc cần giao), lấy từ module `Tasks`. Hai nguồn đếm khác nhau: `Customer_Cares` chỉ đếm lượt đã bấm "Hoàn tất" nên luôn thấp hơn (spec gốc mục 1.5).

| Lựa chọn | Mô tả | Ưu | Nhược |
|---|---|---|---|
| A | Thay hẳn: `/customers` thành dashboard mới, bỏ báo cáo ngày | Gọn, một nguồn | Mất góc nhìn "hôm qua ai làm gì" mà spec cũ đã duyệt |
| **B (đề xuất)** | Một trang CSKH, 2 chế độ xem: **"Quản trị"** (mặc định, theo spec mới) và **"Theo ngày"** (báo cáo ngày cũ) — **cả hai cùng lấy từ `Tasks`** | Một nguồn chân lý; báo cáo ngày chỉ là bộ lọc 1 ngày trên cùng dữ liệu; không phải quét 2 lần | Phải viết lại phần đọc dữ liệu của trang ngày cũ |
| C | Hai trang riêng, hai nguồn | Ít sửa code cũ | Hai con số "lượt chăm sóc" khác nhau trên cùng dashboard → người xem mất tin tưởng |

**Hệ quả của B:** cron `/api/cron/care` (đọc `Customer_Cares`) chuyển thành **phép đối chiếu phụ**: số "CS khách hàng" của CRM hiện cạnh số của dashboard kèm giải thích vì sao thấp hơn — không còn là nguồn chính.

---

## Q2. Giao diện theo bản mẫu của client hay theo hệ đỏ–trắng của repo? [Client] — chặn GĐ3

**Vì sao quan trọng:** đang có **3 hệ giao diện khác nhau**:

| | Màu nhấn | Font | Khung |
|---|---|---|---|
| `ref_cskh.html` (client duyệt) | Nâu đất `#8A5A2C`, nền xám xanh nhạt | Barlow Condensed (tiêu đề) + Be Vietnam Pro | 1 cột, không sidebar |
| `ref_kho.html` (client duyệt) | Xanh navy `#1f4e79` | Be Vietnam Pro + IBM Plex Mono (số) | 1 cột, không sidebar |
| Repo (`product-specs/shared/visual-system.md`) | Đỏ `#C62828`, nền trắng | Geist Sans | Sidebar trái + nhiều trang khác (Email, Lịch, Công nợ…) |

| Lựa chọn | Mô tả |
|---|---|
| A | Theo đúng 2 bản mẫu (mỗi trang một màu) — trung thành nhất nhưng 2 trang trông như 2 sản phẩm |
| **B (đề xuất)** | **Một hệ token thống nhất lấy từ bản mẫu CSKH** (nâu đất + Barlow Condensed + Be Vietnam Pro, số dùng IBM Plex Mono của bản Kho), áp cho cả 2 trang mới; **giữ sidebar** của repo để vẫn vào được Email, Lịch… Trang cũ chuyển dần sang token mới |
| C | Giữ đỏ–trắng của repo, chỉ lấy bố cục/khối từ bản mẫu |

**Đã cố định bất kể chọn gì:** màu nhân viên (Cẩm xanh dương, Hoàng Linh cam, Trúc xanh lá — phân biệt được với người mù màu), màu trạng thái ok/warn/bad tách khỏi màu nhấn, hỗ trợ sáng/tối.

---

## Q3. "Kỳ báo cáo" nghĩa là gì khi quét mỗi ngày? [Client] — chặn GĐ2

**Vì sao quan trọng:** spec gốc định nghĩa kỳ = **từ lần quét trước đến lần quét này** (23/09 → 03/10, 11 ngày). Khi quét mỗi ngày, định nghĩa đó làm kỳ chỉ còn 1 ngày → KPI "170 lượt trong kỳ", "30 khách chưa follow-up trong kỳ" mất ý nghĩa.

| Lựa chọn | Mô tả |
|---|---|
| A | Kỳ = 7 ngày gần nhất (trượt) |
| B | Kỳ = tuần hiện tại (thứ Hai → nay) |
| **C (đề xuất)** | Kỳ = **từ "mốc rà soát" gần nhất đến nay**. Mốc rà soát do chị bấm nút "Chốt kỳ, bắt đầu kỳ mới" (ví dụ sau buổi họp thứ Hai). Nếu chưa bấm thì mặc định thứ Hai tuần này. Khớp đúng cách client đang làm việc (mỗi lần rà soát = một kỳ) |
| D | Cho chọn tự do khoảng ngày trên trang |

C vẫn cho phép xem các kỳ cũ (mỗi mốc là một kỳ đã đóng).

---

## Q4. Mốc "tồn đọng từ 10/08" cố định hay trượt? [Client] — chặn GĐ2

10/08 là mốc client tự chọn lúc bắt đầu theo dõi. Để lâu, danh sách tồn đọng sẽ phình (khách từ tháng 8 mãi nằm đó).

| Lựa chọn | Mô tả |
|---|---|
| A | Cố định 10/08, chỉ đổi khi chị sửa trong cài đặt |
| **B (đề xuất)** | **Cửa sổ trượt cấu hình được, mặc định 60 ngày**; khách có lượt cuối cũ hơn cửa sổ chuyển sang danh sách "Ngủ đông" riêng (không mất, chỉ tách ra) |
| C | Không giới hạn |

---

## Q5. Khối "Đối chiếu với lần quét 22/09" so với mốc nào khi chạy hằng ngày? [Client] — chặn GĐ2

**Đề xuất:** so với **mốc rà soát trước** (theo Q3-C): "Kỳ trước có 125 khách tồn đọng → nay 2 đã đặt, 32 đã chăm sóc lại, 91 chưa ai liên hệ". Đổi tên khóa dữ liệu `doi_chieu_22_09` → `doi_chieu_moc_truoc`. Có thể chọn mốc khác từ danh sách mốc cũ.

---

## Q6. Có dùng Claude API để phân nhóm khách và viết "việc cần giao", "câu hỏi đốc thúc", "câu hỏi kế toán" không? [Client + Chủ dự án] — chặn GĐ4

**Vì sao quan trọng:** khoảng 40% giá trị trang là văn bản hành động (ai làm gì, hỏi câu gì, hạn khi nào). Code thuần không viết được; luật từ khóa phân nhóm theo spec còn "chưa kiểm chứng".

| Lựa chọn | Mô tả | Chi phí ước tính |
|---|---|---|
| **A (đề xuất)** | Claude API: phân nhóm từng khách + sinh văn bản từ số liệu đã tính, có kiểm tra số tự động | Cỡ vài chục nghìn token/ngày → **dưới ~25.000đ/ngày** (sẽ tính chính xác ở file 08 theo bảng giá hiện hành) |
| B | Chỉ luật từ khóa cho phân nhóm; bỏ hẳn văn bản tự sinh, thay bằng danh sách có cấu trúc (bảng "khách – lý do – số ngày") | 0đ, nhưng mất phần "đốc thúc" có ngữ cảnh |
| C | Luật từ khóa + chị tự viết việc cần giao | 0đ, tốn công chị mỗi ngày |

**Lưu ý dữ liệu:** chọn A nghĩa là tên khách và ghi chú chăm sóc được gửi tới Anthropic API để xử lý. Cần client đồng ý. Có thể giảm bớt bằng cách che số điện thoại (đã rút gọn sẵn) và không gửi số tiền công nợ chi tiết khi không cần.

Cần thêm: **API key Anthropic** do client/chủ dự án tạo và tự nhập vào Vercel (không nhập hộ).

---

## Q7. Văn bản AI tự lên trang, hay chị duyệt trước? [Client] — chặn GĐ4

| Lựa chọn | Mô tả |
|---|---|
| A | Tự công bố, có nhãn "AI soạn từ dữ liệu CRM lúc …" |
| **B (đề xuất)** | Tự công bố nhưng **mỗi câu có nút sửa/ẩn**; chỉnh sửa của chị được giữ lại và ưu tiên hơn bản AI hôm sau nếu tình huống chưa đổi |
| C | Bản nháp, chị bấm "Duyệt" mới hiện cho người khác xem |

---

## Q8. Quét lúc mấy giờ, mấy lần/ngày? Gói Vercel nào? [Client + Chủ dự án] — chặn GĐ7

**Ràng buộc đã kiểm (tài liệu Vercel, 2026):** gói **Hobby** cho tối đa 100 cron nhưng **mỗi cron chỉ chạy 1 lần/ngày**, giờ chạy lệch **±59 phút**, mỗi lần chạy tối đa **300 giây**. Gói **Pro** chạy được theo phút, tối đa 800 giây/lần.

| Lựa chọn | Mô tả |
|---|---|
| **A (đề xuất)** | Hobby: **1 lần quét đầy đủ lúc ~05:00** (xong trước giờ làm, câu hỏi có hạn "17h hôm nay" vẫn hợp lý) + **nút "Quét lại ngay"** cho chị khi cần số mới trong ngày |
| B | Pro: quét 2–3 lần/ngày (05:00, 12:00, 17:00) | 
| C | Như A nhưng giờ khác |

Nếu Hobby: cần chia quét thành nhiều bước nhỏ nối tiếp, mỗi bước < 300 giây (thiết kế ở file 03).

---

## Q9. Dùng tài khoản CRM nào để quét? [Client] — chặn GĐ0

Spec gốc yêu cầu tài khoản **giám đốc** (xem toàn công ty). Hiện cron dùng tài khoản trong `CRM_USERNAME`.

**Đề xuất:** tạo **một tài khoản CRM riêng tên "dashboard-bot"**, quyền **chỉ xem** nhưng thấy toàn công ty. Lợi ích: đổi mật khẩu cá nhân không làm hỏng quét; lịch sử đăng nhập tách bạch; tài khoản `Administrator` (test) bị loại khỏi số liệu theo spec. Nếu CRM không cho tạo quyền chỉ-xem, dùng tài khoản giám đốc và ghi rõ rủi ro.

Cần xác nhận thêm: CRM có tự đăng xuất phiên cũ khi đăng nhập nơi khác không (nếu có, bot đăng nhập sẽ "đá" chị ra).

---

## Q10. Ai được xem gì trên dashboard? [Client] — chặn GĐ3

Repo đã có vai trò `ADMIN, SALES, KETOAN, KHO, MARKETING`.

| Phần | Đề xuất quyền xem |
|---|---|
| Trang CSKH — toàn bộ | ADMIN (chị Hiền) |
| Trang CSKH — chỉ dòng của mình + câu hỏi gửi mình | SALES (Cẩm, Hoàng Linh, Trúc) — **tùy chọn**, mặc định tắt |
| Trang Kho · Xuất bán · Công nợ | ADMIN; KETOAN và KHO chỉ thấy câu hỏi gửi đúng mình |
| Nút "Quét lại", sửa nhóm, sửa văn bản AI, chốt kỳ | ADMIN |

Câu hỏi cho client: có muốn nhân viên tự vào xem câu hỏi của mình (thay vì chị copy dán Zalo) không?

---

## Q11. Phạm vi bản đầu tiên (V1)? [Client] — chặn thứ tự GĐ

| Lựa chọn | V1 gồm |
|---|---|
| **A (đề xuất)** | Trang CSKH đầy đủ (kể cả AI) → rồi mới làm trang Kho · Xuất bán · Công nợ (V2) |
| B | Cả 2 trang cùng lúc |
| C | Trang Kho trước (nếu chuyện kho/công nợ đang gấp hơn) |

Theo dõi trạng thái câu hỏi (Chưa gửi / Đã gửi / Đã trả lời / Đạt): **đề xuất làm luôn trong V1** cho trang CSKH vì nó là thứ biến dashboard thành công cụ quản lý thật.

---

## Q12. Tên khách hiển thị đầy đủ hay rút gọn? Gộp khách trùng thế nào? [Client] — chặn GĐ2

- Dữ liệu mẫu đang rút gọn tên (dạng `"TNHH Giày …"`, số điện thoại còn 4 số cuối). Đề xuất: **database lưu đủ**, giao diện hiện đủ cho ADMIN, rút gọn khi xuất/chia sẻ.
- Khách trùng do nhập 2 lần, sai một chữ (dữ liệu mẫu có 1 ca, dạng "HOA KIỂNG X" / "HOA KIỂN X"): chuẩn hóa tên (spec R7) **không** gộp được vì khác chữ. Đề xuất: ưu tiên ghép theo **mã khách CRM** khi có; với ca nghi trùng, hệ thống **gợi ý**, chị bấm "Gộp" để xác nhận (lưu bảng bí danh).

---

## Q13. Lưu lịch sử bao lâu? [Chủ dự án] — chặn GĐ1

Neon gói miễn phí giới hạn dung lượng (cỡ 0,5 GB). Tồn kho có ~2.190 dòng/ngày.

**Đề xuất:** lưu **mãi** số liệu đã tính (bản dashboard mỗi ngày, vài chục KB) và bản ghi công việc CSKH (nhỏ); lưu **chi tiết thô** tồn kho/công nợ **90 ngày** rồi xóa, chỉ giữ tổng hợp. Xem lại khi gần chạm giới hạn.

---

## Q14. Các tham số nghiệp vụ có cho chị tự chỉnh không? [Client] — không chặn

Đề xuất đưa vào trang **Cài đặt** (chỉ ADMIN), mặc định = giá trị spec gốc:

| Tham số | Mặc định |
|---|---|
| Số ngày coi là "chưa follow-up" | 3 |
| Loại lượt cần theo dõi (FOLLOW_TYPES) | Hỏi Hàng, Báo Giá, Nắm bắt thông tin, Phản hồi khách hàng, Chào mẫu, Lên lịch hẹn |
| Danh sách nhân viên CSKH + màu | Cẩm, Hoàng Linh, Trúc |
| Ngưỡng KPI (chưa follow-up đỏ khi > 20; tỷ lệ báo giá→đặt hàng ok ≥ 40%, đỏ < 25%) | như spec |
| Ngưỡng "số liệu cũ" | **cần chốt**: spec ghi 3 ngày, HTML mẫu dùng 1,5 ngày (xem file 12) |
| Ngưỡng lệch xuất kho/công nợ | 1.000đ |

---

## Bảng tổng hợp để trả lời

| Mã | Đề xuất | Chặn |
|---|---|---|
| Q1 | B — một trang 2 chế độ, cùng nguồn `Tasks` | GĐ1 |
| Q2 | B — một hệ token từ bản mẫu CSKH, giữ sidebar | GĐ3 |
| Q3 | C — kỳ theo mốc rà soát | GĐ2 |
| Q4 | B — cửa sổ 60 ngày + danh sách ngủ đông | GĐ2 |
| Q5 | So với mốc rà soát trước | GĐ2 |
| Q6 | A — Claude API (cần đồng ý gửi dữ liệu + API key) | GĐ4 |
| Q7 | B — tự công bố, sửa/ẩn được | GĐ4 |
| Q8 | A — Hobby, quét ~05:00 + nút quét lại | GĐ7 |
| Q9 | Tài khoản bot chỉ-xem riêng | GĐ0 |
| Q10 | Theo bảng quyền ở trên | GĐ3 |
| Q11 | A — CSKH trước, Kho sau; có theo dõi câu hỏi | Thứ tự |
| Q12 | Lưu đủ tên; gộp trùng có xác nhận | GĐ2 |
| Q13 | Số đã tính lưu mãi, thô 90 ngày | GĐ1 |
| Q14 | Có trang Cài đặt | Không chặn |
