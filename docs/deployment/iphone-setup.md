# Bàn giao trên iPhone

1. Trong GitHub mở kho **su-pham-tien-phong**, chọn nhánh **feature/learning-workspace**. Nếu chưa có PR, bấm **Compare & pull request** và chọn base **main**. Mở **Files changed** và **Checks**. Dùng Safari ở chế độ trang web cho máy tính nếu app GitHub ẩn Settings.
2. Có thể xem ảnh giao diện trong **docs → testing** ngay từ nhánh. Khi Validate đạt, duyệt và merge để chuẩn bị staging.
3. Trong Supabase, chọn dự án staging chuyên dụng. Sao lưu trước khi migrate. Ở **Connect**, lấy connection string hỗ trợ TLS. Trong **Project Settings → API Keys**, lấy URL dự án và **publishable key**. Trong **Authentication**, bật Email/Password, chọn khóa ký ES256 hoặc RS256 và chuẩn bị các tài khoản thử thuộc quyền quản lý của bạn.
4. Trong Cloudflare → **Workers & Pages**, kích hoạt workers.dev của tài khoản nếu cần. Mở **Hyperdrive** và tạo cấu hình trỏ đến PostgreSQL staging. Ghi lại ID. Tại **My Profile → API Tokens** tạo token deploy Worker cho đúng tài khoản.
5. Trong GitHub → **Settings → Pages → Source**, chọn **GitHub Actions**. Vào **Settings → Environments**, tạo **staging**, hạn chế nhánh main và thêm người duyệt nếu gói tài khoản hỗ trợ. Điền variables và secrets theo [bảng cấu hình](README.md). Mật khẩu DB và token Cloudflare chỉ điền trong ô **Environment secrets**.
6. Mở **Actions → Publish staging → Run workflow** và chọn **main**. Để xuất bản giao diện, dùng workflow **Deploy frontend to GitHub Pages** trên main. Mở job **deploy** để lấy URL trang. Xem mục GitHub Pages trong runbook để thiết lập các biến công khai cho frontend. Đăng nhập bằng tài khoản thử. Nếu phát hành dừng, xem tên bước và lỗi trong Actions.
7. Sau lần đăng nhập đầu tiên, UUID của tài khoản có trong profiles. Chủ DB có thể dùng **Supabase → SQL Editor** để cấp quyền cho UUID đã đối chiếu với **Authentication → Users**. Thay phần trong dấu ngoặc bằng UUID thật và kiểm tra hàng trả về. Dùng tài khoản editor riêng để duyệt.

```sql
UPDATE profiles SET role='teacher' WHERE id='<UUID của giáo viên>'::uuid RETURNING id,role;
```

Thử toàn bộ bài học, làm bài và xem kết quả bằng Safari trên iPhone. AI là tích hợp tùy chọn.
