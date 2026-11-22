# Nghiệm thu trên máy Codex Cloud

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và Biome | PASS |
| Build web tĩnh, Node ESM và Wrangler dry-run | PASS |
| Vitest với PostgreSQL | PASS · 10 ca gồm migration lặp, điểm xác định, quyền sở hữu, lưu xung đột, nộp đồng thời, hết giờ, khóa đề và tái hiện đáp án cũ |
| Biên tập và hạn mức | PASS trong cùng bộ Vitest. Gửi duyệt, xuất bản độc lập, lập đề, ghi audit, xử lý báo lỗi và quota provider thử |
| Playwright Chromium | PASS · 4 ca. Hai hành trình học sinh và biên tập chạy trên desktop 1366 × 900 và mobile 375 × 812 |
| Trang tĩnh trong thư mục dự án | PASS · mở bài qua hash route, tải lại deep link ở cả hai kích thước |
| Danh mục và bài đã xuất bản | PASS qua API Node và Worker cục bộ với PostgreSQL |
| Xác thực JWT | PASS trong browser test dùng dịch vụ danh tính riêng cho kiểm thử và JWKS ES256. Hosted Supabase cần xác minh tại staging |
| AI bên ngoài | Chưa chạy · cần endpoint, model và ngân sách đã duyệt |
| Safari trên iPhone thật | Chưa chạy |
| CI từ xa, URL staging, production | Kết quả từ xa cần đọc tại GitHub. Phát hành cần cấu hình dịch vụ và phê duyệt |

Mỗi suite dùng database riêng. Playwright đăng nhập qua form, tải JWKS, ghi PostgreSQL, tải lại trang và mở lại kết quả. Dịch vụ danh tính cho test chỉ chạy từ thư mục tests. Gitleaks quét lịch sử commit tại CI.

Ảnh thư viện từ dữ liệu seed của ứng dụng · [điện thoại](catalog-mobile.png) và [desktop](catalog-desktop.png).
