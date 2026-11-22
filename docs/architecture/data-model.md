# Dữ liệu và phiên bản

| Quan hệ | Ràng buộc nghiệp vụ |
| --- | --- |
| profiles | UUID từ subject đã xác minh. Tài khoản mới có vai trò learner |
| courses → content_versions | Một môn/chủ đề chứa bài và câu hỏi. Mỗi series có số phiên bản duy nhất. Bản published được khóa bằng trigger |
| exams → exam_items | Mỗi hàng exams là một phiên bản đề độc lập, tham chiếu đúng phiên bản bài và câu hỏi. Transaction tạo toàn bộ items, sau đó niêm phong đề |
| attempts | Tối đa một lần làm đang mở cho mỗi người và đề. Deadline theo đồng hồ DB. Luồng lưu, hết hạn và nộp khóa cùng một hàng |
| answers, revision | Bản đồ câu hỏi → chỉ số lựa chọn nằm trong attempt. Điều kiện revision bảo vệ các lần lưu đến sai thứ tự |
| score, total, submitted_at | Lưu cùng transaction chấm điểm, tái sử dụng khi nhận yêu cầu nộp lại. Chỉ trả đáp án và lời giải cho chủ bài sau khi hoàn tất |
| progress | Một bản ghi cho mỗi người và phiên bản bài đã hoàn thành |
| reports, audit | Báo lỗi gắn với bài, trạng thái xử lý và dấu vết biên tập |
| tutor_usage | Số yêu cầu đã dành theo ngày của database, giới hạn trước khi gọi provider |

Hết giờ được kết toán khi API tiếp theo mở, lưu hoặc nộp bài. Trang lịch sử có thể dẫn tới một bài vừa quá giờ.
Migration SQL có thứ tự, checksum và advisory lock. Migration và seed cùng transaction. Thêm file mới cho lần thay đổi tiếp theo.
