# Phát hành và vận hành

Web tĩnh, API Node và bundle Worker đã build trên máy cloud. Workflow **Publish staging** chạy thủ công từ main sau khi merge. GitHub Environments lưu kết quả triển khai.

| Nơi đặt | Tên | Mục đích |
| --- | --- | --- |
| staging, Secrets | STAGING_DATABASE_URL | URL PostgreSQL cho migration, dùng TLS và kiểm tra chứng thư. Chọn endpoint trực tiếp hoặc pooler session truy cập được từ runner |
| staging, Secrets | CLOUDFLARE_API_TOKEN | Deploy Worker trong đúng tài khoản staging |
| staging, Variables | CLOUDFLARE_ACCOUNT_ID, HYPERDRIVE_ID | Tài khoản và binding Hyperdrive kết nối cùng DB được migrate |
| staging, Variables | SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY | URL dự án staging và khóa publishable. Bật Email/Password và khóa ký ES256 hoặc RS256 |
| staging, Variables | VITE_API_BASE | URL Worker có hậu tố /api/v1. Tên Worker là su-pham-tien-phong-staging |
| staging, Variables | WEB_ORIGIN | Origin chính xác của frontend gồm scheme và hostname, không kèm đường dẫn hay dấu gạch cuối |
| Server tùy chọn | AI_CHAT_URL, AI_MODEL, AI_API_KEY | Endpoint HTTPS tương thích Chat Completions, model đã duyệt và secret riêng tại Worker hoặc Node |

Dùng project riêng cho staging. Tắt Supabase Data API nếu chỉ truy cập qua Hono. Đối chiếu quyền bảng sau khi migrate. Kiểm tra quota và điều khoản hiện hành tại tài khoản nhà cung cấp.

1. Duyệt PR và kết quả Validate trước khi merge. Cấu hình Supabase, Hyperdrive, Pages và environment theo hướng dẫn iPhone.
2. Chạy Publish staging từ main. Workflow kiểm tra cấu hình, test và build, áp dụng migration rồi deploy Worker. Nó gọi danh mục và mở một bài qua HTTPS trước khi cấp artifact cho Pages.
3. Mở URL do Deploy Pages trả về. Thử tra bài, đăng nhập, lưu, tải lại, nộp và mở lịch sử. CORS phải trùng origin trang trong thanh địa chỉ.
4. Với Tutor, quản trị viên đặt endpoint và model trong cấu hình deploy đã duyệt, thêm secret tại Worker. Kiểm tra hạn mức nhà cung cấp và một lượt gợi ý có nguồn bài/version.

## Sự cố và chuyển host

- Catalog 503 hoặc 500 · kiểm tra Hyperdrive, migration, SSL và quyền đọc bảng. Endpoint health độc lập với DB.
- Lỗi 401 · kiểm tra issuer, khóa ký, giờ và phiên. Lỗi 403 · kiểm tra vai trò trong profiles. Lỗi lưu 409 · tải lại trạng thái máy chủ rồi chọn lại.
- Trước migration, tạo backup qua dashboard hoặc pg_dump định dạng custom. Thử pg_restore với --no-owner và --exit-on-error vào DB riêng, đọc lại danh mục và đối chiếu attempt cũ. Sao lưu nhân sự và danh tính Supabase theo chính sách riêng.
- Khi phát hành lỗi, dừng workflow, khôi phục phiên bản Worker trước tại Cloudflare và triển khai lại web của commit tốt. Kiểm tra tính tương thích schema. Khôi phục DB vào instance riêng để đối chiếu trước khi chuyển lưu lượng.
- Sang Node, chạy dist/node.mjs với Node 24, production dependencies, DATABASE_URL, SUPABASE_URL và WEB_ORIGIN. Phục vụ dist/web bằng static host và build lại với VITE_API_BASE tương ứng.
- Đối chiếu điều khoản Pages khi dùng thử. Khi chuyển sang SaaS thương mại, chuyển frontend sang static host phù hợp mô hình kinh doanh. Hạn mức và giá tùy dịch vụ và tài khoản.
