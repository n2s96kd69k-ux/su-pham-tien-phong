# Biên tin cậy

- Browser nhận khóa publishable của Supabase. API xác minh ES256/RS256 qua JWKS và yêu cầu sub, exp, issuer, audience. Quyền nhân sự đọc từ database cho từng request. Chỉ quản trị viên database cấp vai trò.
- Tất cả truy cập bài làm lọc owner trước khi đọc hoặc ghi. API chỉ gửi đề, lựa chọn và trạng thái đã lưu cho đến khi chấm xong. Xung đột revision trả 409. Máy chủ tự tính giờ và điểm trong transaction.
- Các bảng ứng dụng được thu hồi quyền Data API cho anon/authenticated, kể cả bảng chứa đáp án. Dùng database hoặc project chuyên dụng, xác minh grants sau khi triển khai. Rà lại quyền sau mỗi migration thêm bảng.
- React hiển thị nội dung như văn bản. Không chèn HTML từ giáo viên hoặc từ provider. Hạn chế origin của API bằng WEB_ORIGIN. Không lưu nội dung câu hỏi, token hay prompt vào log sự cố.
- Gateway chỉ gửi dữ liệu của một bài đã công bố. Hạn mức 5 yêu cầu/tài khoản/ngày, 100 toàn hệ thống/ngày, tối đa 220 token đầu ra, timeout 12 giây. Yêu cầu thất bại cũng tiêu thụ một lượt. Đặt thêm ngân sách cứng tại provider trước khi kích hoạt.
- Dữ liệu cá nhân giới hạn ở UUID, vai trò và hoạt động học. Mật khẩu do Supabase quản lý. Quy trình xóa dữ liệu, lưu giữ, khôi phục tài khoản và tiếp nhận sự cố phải được vận hành trước khi mở rộng cho học sinh thật.
- Biên tập viên có quyền xem câu hỏi đã duyệt để lập đề. Giáo viên chỉ sửa nháp sở hữu. Người duyệt và tác giả phải khác nhau. Cấp các vai trò này cho nhân sự được tin cậy.
- Quyền GitHub và Cloudflare nằm ở environment staging có phê duyệt. CI trên nhánh và PR dùng dữ liệu tự sinh. Khi có sự cố, thu hồi token liên quan qua nhà cung cấp, kiểm tra audit và khôi phục sang database riêng để đối chiếu.
