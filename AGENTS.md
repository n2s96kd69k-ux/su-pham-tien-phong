# Sư Phạm Tiên Phong

Dùng checkout hiện có cho mỗi nhiệm vụ cloud. Tạo nhánh cho thay đổi và gửi PR. Bắt đầu từ README, DESIGN.md và docs/roadmap.md.

- `apps/web` chứa giao diện tiếng Việt. API và kiểm tra quyền nằm trong `apps/api`. Chỉ chia sẻ hợp đồng trong `packages/contracts`. Đáp án của đề và thông tin kết nối nằm phía máy chủ.
- Cài bằng `pnpm install --frozen-lockfile`. Chạy `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` và `pnpm e2e` trước khi gửi PR. Chạy `pnpm format` để chuẩn hóa trình bày.
- Giữ migration đã áp dụng. Thêm migration mới, thử trên PostgreSQL biệt lập, kiểm tra rollback và bảo toàn điểm lịch sử.
- Kiểm tra quyền ở máy chủ cho từng tài nguyên. Chấm điểm trong transaction, cố định phiên bản và đối chiếu revision khi ghi.
- Chỉ thêm thư viện có chức năng cụ thể. Cập nhật registry và lockfile. Đưa trạng thái kiểm thử thật, biến cấu hình và ảnh mobile của thay đổi UI vào PR.
- Chủ dự án phê duyệt việc phát hành và thay đổi dữ liệu dịch vụ thật. Tài khoản mẫu tự động chỉ dùng trong tests.
