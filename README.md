# Sư Phạm Tiên Phong

Tiên phong trong phương pháp. Vững vàng trong tri thức.

Không gian học tập tiếng Việt cho học sinh, giáo viên và biên tập viên. Khách đọc hai bài Toán do dự án tự biên soạn. Học sinh đăng nhập để lưu tiến độ, làm đề có thời hạn và xem lời giải. Giáo viên soạn học liệu và gửi duyệt. Biên tập viên công bố phiên bản và tạo đề từ câu hỏi đã duyệt.

## Chạy trong Codex Cloud

Dùng Node 24, pnpm 10.32.1 và checkout hiện tại. Tại thư mục gốc:

```sh
pnpm install --frozen-lockfile
pnpm db:local
```

Giữ tiến trình PostgreSQL mở. Lần đầu lệnh tạo cụm riêng tại `.local/pg`, sinh mật khẩu ngẫu nhiên và áp dụng migration. Khi khởi động lại, dữ liệu học tập trên máy được giữ. Mở hai terminal nữa tại cùng thư mục:

```sh
# Terminal API
pnpm api:local
# Terminal web
pnpm dev
```

Vite dùng cổng 5173 và API dùng 8787. Kiểm tra dữ liệu bằng `node scripts/check-catalog.mjs http://127.0.0.1:8787/api/v1`. Khách có thể học ngay. Để đăng nhập, thiết lập Supabase trong `.env` theo [.env.example](.env.example), khởi động lại API và Vite rồi dùng tài khoản của dự án Supabase đó. Bộ test trình duyệt tự dựng dịch vụ danh tính biệt lập.

Với PostgreSQL riêng, đặt `DATABASE_URL` trong `.env`, chạy `pnpm db:migrate`, rồi `pnpm api`. Migration bao gồm hai bài học và một đề minh họa. Dùng database dành riêng cho ứng dụng.

## Kiểm tra

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

Có thể đặt `CHROMIUM_PATH` để dùng Chromium đã cài trên máy. Vitest và Playwright dùng PostgreSQL thật trên các cổng cục bộ 55521 và 55522. Web tĩnh được build ở `dist/web`. Hono chạy bằng Node từ `dist/node.mjs` (cần production dependencies) hoặc Worker từ `apps/api/src/worker.ts`.

## Trạng thái bàn giao

Luồng học–thi và biên tập đã chạy trên máy cloud. Cấu hình CI kiểm tra từng PR. Phát hành staging là hành động thủ công sau khi merge và cấu hình dịch vụ. Xem [nghiệm thu](docs/testing/acceptance.md), [lộ trình](docs/roadmap.md), [kiến trúc](docs/architecture/overview.md), [hướng dẫn trên iPhone](docs/deployment/iphone-setup.md) và [các thư viện](docs/references/repo-registry.md).

Học liệu ban đầu là ví dụ gốc của dự án. Chủ kho chưa chọn giấy phép phân phối mã và học liệu. Các gói phụ thuộc và font tuân theo giấy phép riêng của chúng.
