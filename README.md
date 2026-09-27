# Dashboard theo dõi công việc

Dashboard nội bộ Bao Bì Giấy Toàn Quốc, xây bằng Next.js, React, TypeScript và Prisma. Database PostgreSQL được chạy trên Neon; website deploy trên Vercel.

## Cài đặt và chạy

1. Cài Node.js và chạy `npm ci` trong thư mục dự án.
2. Sao chép `.env.example` thành `.env.local`, điền thông tin database, `AUTH_SECRET` và `INGEST_API_KEY` riêng.
3. Chạy `npx prisma generate`.
4. Với database mới, kiểm tra schema rồi chạy `npx prisma db push`.
5. Chạy `npm run dev`, mở `http://localhost:3000`.

Tài khoản đăng nhập nằm trong database. Không lưu mật khẩu của tài khoản đang dùng trong Git. `npm run db:seed` tạo dữ liệu mẫu; chỉ chạy trên database thử nghiệm vì script thêm dữ liệu mẫu và không dùng để khôi phục production.

## Các lệnh

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy local |
| `npm run lint` | Kiểm tra ESLint |
| `npm run build` | Generate Prisma và build production |
| `npm start` | Chạy bản production đã build |
| `npm run db:studio` | Mở Prisma Studio |

## Cấu trúc

```text
src/app/          Các trang, server actions và API ingest
src/components/   Component giao diện
src/lib/          Truy vấn dữ liệu và tiện ích
prisma/           Schema và seed dữ liệu mẫu
product-specs/    Đặc tả sản phẩm, UI và thứ tự triển khai từng trang
design-demos/     Prototype HTML và ảnh tham khảo
docs/             Hướng dẫn vận hành
```

## Luồng dữ liệu

Task lấy dữ liệu từ CRM/công cụ nguồn → gửi tới `/api/ingest/*` với header `x-api-key` → Prisma ghi PostgreSQL → dashboard đọc lại để hiển thị. Code được push lên Git không bao gồm các bản ghi database. Dữ liệu thật vẫn nằm trên Neon.

Đặc tả CSKH và giới hạn dữ liệu hiện tại nằm trong [product-specs/cskh](product-specs/cskh/README.md). Các file `.env`, token, database local, thư mục dependencies, cache và build đã được loại khỏi Git. Cấu hình môi trường production được quản lý riêng trên Vercel.
