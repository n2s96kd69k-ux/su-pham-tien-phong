# HTTP API v1

Tiền tố `/api/v1`. JSON. Route `/me/*` cần Bearer JWT có chữ ký, issuer đúng dự án và audience authenticated. Lỗi trả `{"error":"…"}` với 400 sai dữ liệu, 401 phiên hết hạn, 403 thiếu quyền, 404 không thấy tài nguyên trong phạm vi, 409 xung đột, 429 hạn mức hoặc 503 dịch vụ chưa sẵn sàng.

| Phương thức và đường dẫn | Tác dụng |
| --- | --- |
| GET /health, /catalog, /lessons/:id | Khả năng cấu hình, danh mục, bài đã công bố và mô tả đề |
| GET /me/profile, /me/history | Quyền cá nhân, bài đã học và lịch sử thi |
| POST /me/lessons/:id/complete | Ghi nhận hoàn thành một lần |
| POST /me/exams/:id/start | Tạo hoặc tiếp tục lần làm đang mở |
| GET /me/attempts/:id | Tải trạng thái đã lưu, kết toán khi hết giờ |
| PUT /me/attempts/:id/answers | JSON gồm question UUID, choice chỉ số từ 0, revision nhận từ máy chủ. Tải lại sau 409 |
| POST /me/attempts/:id/submit | Chấm đúng một lần. Mỗi câu đúng 1 điểm |
| GET, POST /me/studio | Học liệu trong phạm vi nhân sự hoặc tạo bản nháp |
| PUT /me/studio/:id | Sửa bản nháp sở hữu |
| POST /me/studio/:id/review hoặc /publish | Gửi duyệt hoặc xuất bản, ghi audit |
| POST /me/exams | Editor tạo đề từ lesson, danh sách questions, title và minutes |
| POST, GET /me/reports | Tạo báo lỗi hoặc xem hàng xử lý theo quyền |
| POST /me/reports/:id/resolve | Editor đánh dấu đã xử lý |
| POST /me/lessons/:id/hint | Gợi ý dựa trên nội dung bài đã xuất bản, kèm lesson và version |

Các trường được chấp nhận cho học liệu và kiểu trả về cho UI nằm trong `packages/contracts/index.ts`. Đề phiên bản mới có UUID mới. GET /health chỉ mô tả cấu hình adapter. Dùng /catalog và mở một bài để kiểm tra kết nối cơ sở dữ liệu.
