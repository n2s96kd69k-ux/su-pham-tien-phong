# Registry · thư viện và nguồn tham khảo

Đối chiếu package đã cài với manifest và lockfile ngày 23/11/2026. Phiên bản và giấy phép bên dưới lấy từ metadata của gói đã cài. Các nguồn còn lại được ghi để tra cứu khi mở rộng.

| Gói | Upstream | Phiên bản | Giấy phép | Phạm vi và lưu ý |
| --- | --- | --- | --- | --- |
| @fontsource/be-vietnam-pro | https://github.com/fontsource/font-files | 5.3.0 | OFL-1.1 | Font giao diện. Kèm OFL trong dist |
| @fontsource/newsreader | https://github.com/fontsource/font-files | 5.3.0 | OFL-1.1 | Font tiêu đề. Kèm OFL trong dist |
| @hono/node-server | https://github.com/honojs/node-server | 2.1.11 | MIT | Adapter Node |
| @supabase/supabase-js | https://github.com/supabase/supabase-js | 2.119.2 | MIT | Đăng nhập có cấu hình public |
| drizzle-orm | https://github.com/drizzle-team/drizzle-orm | 0.45.4 | Apache-2.0 | Trình tạo truy vấn catalog |
| hono | https://github.com/honojs/hono | 4.13.20 | MIT | API hai runtime |
| jose | https://github.com/panva/jose | 6.2.18 | MIT | Xác minh chữ ký, issuer và audience |
| postgres | https://github.com/porsager/postgres | 4.1.1 | Unlicense | SQL có tham số và transaction |
| react | https://github.com/react/react | 19.3.1 | MIT | UI |
| react-dom | https://github.com/react/react | 19.3.1 | MIT | Mount UI |
| react-router-dom | https://github.com/remix-run/react-router | 7.18.6 | MIT | Hash routing trên Pages |
| zod | https://github.com/colinhacks/zod | 4.6.7 | MIT | Hợp đồng và kiểm tra dữ liệu |
| @biomejs/biome | https://github.com/biomejs/biome | 2.6.8 | MIT OR Apache-2.0 | Định dạng và lint |
| @playwright/test | https://github.com/microsoft/playwright | 1.65.1 | Apache-2.0 | Kiểm thử trình duyệt |
| @types/node | https://github.com/DefinitelyTyped/DefinitelyTyped | 24.19.2 | MIT | Công cụ biên dịch hoặc định nghĩa kiểu |
| @types/react | https://github.com/DefinitelyTyped/DefinitelyTyped | 19.3.0 | MIT | Công cụ biên dịch hoặc định nghĩa kiểu |
| @types/react-dom | https://github.com/DefinitelyTyped/DefinitelyTyped | 19.3.0 | MIT | Công cụ biên dịch hoặc định nghĩa kiểu |
| embedded-postgres | https://github.com/leinelissen/embedded-postgres | 18.7.0-beta.19 | MIT | Database thật chỉ dùng cho phát triển và test |
| esbuild | https://github.com/evanw/esbuild | 0.28.2 | MIT | Build Node ESM |
| tsx | https://github.com/privatenumber/tsx | 4.23.15 | MIT | Chạy TypeScript ở máy phát triển |
| typescript | https://github.com/microsoft/TypeScript | 5.9.3 | Apache-2.0 | Công cụ biên dịch hoặc định nghĩa kiểu |
| vite | https://github.com/vitejs/vite | 7.3.8 | MIT | Build web tĩnh |
| vitest | https://github.com/vitest-dev/vitest | 4.1.12 | MIT | Kiểm thử nghiệp vụ |
| wrangler | https://github.com/cloudflare/workers-sdk | 4.166.0 | MIT OR Apache-2.0 | Bundle, kiểm thử Worker và phát hành có duyệt |

pnpm 10.32.1 điều phối workspace, Gitleaks v8.30.0 quét lịch sử (SHA-256 được khóa trong CI). PostgreSQL thực chạy qua embedded-postgres trong test. Workflow pin Actions bằng SHA trong .github/workflows.

## Danh mục đã cân nhắc

Danh mục từ đặc tả ban đầu. “Tham khảo” là nguồn ứng viên, chưa thẩm định version hay giấy phép để đưa mã vào sản phẩm.

| Nguồn | Phân loại | Quyết định |
| --- | --- | --- |
| https://github.com/facebook/react | CORE | Tham khảo, chưa tích hợp |
| https://github.com/vitejs/vite | CORE | Dùng trong source hoặc CI |
| https://github.com/remix-run/react-router | CORE | Dùng trong source hoặc CI |
| https://github.com/honojs/hono | CORE | Dùng trong source hoặc CI |
| https://github.com/honojs/node-server | CORE | Dùng trong source hoặc CI |
| https://github.com/supabase/supabase | CORE / PROVIDER CANDIDATE | Provider tùy cấu hình |
| https://github.com/drizzle-team/drizzle-orm | CORE | Dùng trong source hoặc CI |
| https://github.com/colinhacks/zod | CORE | Dùng trong source hoặc CI |
| https://github.com/postgres/postgres | CORE — DATABASE ENGINE | Dùng trong source hoặc CI |
| https://github.com/cloudflare/workers-sdk | CORE / DEVOPS | Dùng trong source hoặc CI |
| https://github.com/microsoft/TypeScript | CORE | Dùng trong source hoặc CI |
| https://github.com/pnpm/pnpm | CORE | Dùng trong source hoặc CI |
| https://github.com/tailwindlabs/tailwindcss | CORE | Tham khảo, chưa tích hợp |
| https://github.com/shadcn-ui/ui | CORE | Tham khảo, chưa tích hợp |
| https://github.com/lucide-icons/lucide | OPTIONAL, hữu ích | Tham khảo, chưa tích hợp |
| https://github.com/TanStack/query | OPTIONAL, thường hữu ích ở UI dữ liệu | Tham khảo, chưa tích hợp |
| https://github.com/KaTeX/KaTeX | OPTIONAL, dùng khi cần hiển thị công thức | Tham khảo, chưa tích hợp |
| https://github.com/remarkjs/remark | OPTIONAL | Tham khảo, chưa tích hợp |
| https://github.com/ueberdosis/tiptap | OPTIONAL — KHÔNG BẮT BUỘC P0 | Tham khảo, chưa tích hợp |
| https://github.com/storybookjs/storybook | OPTIONAL — KHI COMPONENT LIBRARY ĐỦ LỚN | Tham khảo, chưa tích hợp |
| https://github.com/google-labs-code/design.md | REFERENCE | Tham khảo, chưa tích hợp |
| https://github.com/Nutlope/hallmark | REFERENCE / OPTIONAL AGENT SKILL | Tham khảo, chưa tích hợp |
| https://github.com/vitest-dev/vitest | CORE / CI | Dùng trong source hoặc CI |
| https://github.com/microsoft/playwright | CORE / CI | Dùng trong source hoặc CI |
| https://github.com/gitleaks/gitleaks | CORE / CI | Dùng trong source hoặc CI |
| https://github.com/OWASP/ASVS | REFERENCE — SECURITY STANDARD | Tham khảo, chưa tích hợp |
| https://github.com/actions/checkout | CORE / CI | Dùng trong source hoặc CI |
| https://github.com/actions/setup-node | CORE / CI | Dùng trong source hoặc CI |
| https://github.com/pnpm/action-setup | CORE / CI | Dùng trong source hoặc CI |
| https://github.com/cloudflare/wrangler-action | OPTIONAL / DEPLOY | Tham khảo, chưa tích hợp |
| https://github.com/thedaviddias/Front-End-Checklist | REFERENCE | Tham khảo, chưa tích hợp |
| https://github.com/goldbergyoni/nodebestpractices | REFERENCE | Tham khảo, chưa tích hợp |
| https://github.com/realworld-apps/realworld | REFERENCE | Tham khảo, chưa tích hợp |
| https://github.com/ryanmcdermott/clean-code-javascript | REFERENCE | Tham khảo, chưa tích hợp |
| https://github.com/mattpocock/skills | OPTIONAL AGENT SKILLS | Tham khảo, chưa tích hợp |
| https://github.com/langfuse/langfuse | FUTURE | Tham khảo, chưa tích hợp |
| https://github.com/promptfoo/promptfoo | FUTURE / OPTIONAL CI | Tham khảo, chưa tích hợp |
| https://github.com/pgvector/pgvector | FUTURE | Tham khảo, chưa tích hợp |
| https://github.com/getsentry/sentry | OPTIONAL / FUTURE | Tham khảo, chưa tích hợp |
| https://github.com/triggerdotdev/trigger.dev | FUTURE | Tham khảo, chưa tích hợp |
| https://github.com/qdrant/qdrant | FUTURE — CHỈ THAY KHI CÓ LÝ DO | Tham khảo, chưa tích hợp |
| https://github.com/wojtekmaj/react-pdf | OPTIONAL / FUTURE | Tham khảo, chưa tích hợp |
