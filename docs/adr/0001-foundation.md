# ADR 1 · Nền tảng cho luồng học đầu tiên

Kho ban đầu chỉ có README tại a94fb36. Chọn một workspace pnpm dùng chung TypeScript, React/Vite, Hono và PostgreSQL. Chọn hash routing để tải lại đường dẫn trên Pages. Chọn Supabase Auth với khóa ký bất đối xứng, và lưu quyền nghiệp vụ tại PostgreSQL để có thể thay dịch vụ danh tính.

Drizzle xây truy vấn đọc danh mục. SQL có tham số cùng row lock thuận tiện cho autosave, kết toán và migration kiểm toán được. Dùng CSS và các phần tử HTML chuẩn ở phạm vi bộ màn hình đầu thay cho việc đưa thêm bộ component vào bundle. Native details, fieldset, radio và các nhãn giữ được hành vi bàn phím.

Kết nối PostgreSQL của Worker qua Hyperdrive, Node qua URL. embedded-postgres chỉ phục vụ chạy test và xây máy phát triển độc lập. Tiến trình production cần database đã quản lý và chiến lược backup. Bản đầu có một phạm vi biên tập chung. Phân quyền theo từng trường là quyết định sản phẩm tiếp theo.
