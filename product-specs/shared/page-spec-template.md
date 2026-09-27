# Mẫu đặc tả cho trang tiếp theo

Sao chép cấu trúc này vào `product-specs/<route-name>/`. Mỗi mục phải có câu trả lời cụ thể, không để “TBD” trong bản được duyệt để execute.

1. **README:** một câu hỏi chính của người dùng, vai trò xem, nguồn chân lý, phạm vi V1 và phần ngoài phạm vi.
2. **User flow:** từ đâu vào, ba quyết định quan trọng, luồng mặc định, luồng tra cứu/đào sâu, đường quay lại, quyền truy cập.
3. **Screen spec:** wireframe chữ desktop/mobile, thứ tự thông tin, copy cho từng vùng, kích thước tương đối, filter/sort/search, hành động có thật.
4. **Data contract:** định nghĩa từng chỉ số (công thức, đơn vị, ngày, nguồn), entity và ID, dữ liệu hiện có/thiếu, nhập và lưu, đồng bộ lại, chống trùng, timezone.
5. **States:** loading, bình thường, không phát sinh, không có kết quả tìm kiếm, thiếu một phần, dữ liệu cũ, nguồn lỗi, không quyền; mỗi trạng thái có copy và hành động.
6. **Execution:** thứ tự task nhỏ có phụ thuộc, file dự kiến sửa, migration và tương thích, kiểm thử có ý nghĩa, điều kiện nghiệm thu từ góc nhìn người dùng.

Trước khi code: đối chiếu spec với schema và API thực tế, cập nhật điểm lệch trong file của trang; xem `AGENTS.md` và tài liệu Next tại `node_modules/next/dist/docs/` theo yêu cầu repository. Trước khi deploy: kiểm tra dữ liệu thật, quyền xem, copy về độ tin cậy số liệu, viewport desktop/mobile và regression các trang khác.
