import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, role: string, device: string) {
	await page.goto("/#/login");
	await page.getByLabel("Email").fill(`${role}-${device}@example.test`);
	await page.getByLabel("Mật khẩu").fill("playwright-only");
	await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
	await expect(
		page.getByRole("heading", { name: "Tiến độ của tôi" }),
	).toBeVisible();
}
test("read, sign in, save, reload, submit and revisit results", async ({
	page,
}, info) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: "Bài học đã xuất bản" }),
	).toBeVisible();
	await page.getByRole("link", { name: /Đọc một biểu đồ cột/ }).waitFor();
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true);
	await page.screenshot({
		path: info.outputPath("catalog.png"),
		fullPage: true,
	});
	await login(page, "learner", info.project.name);
	await page.getByRole("link", { name: "Thư viện", exact: true }).click();
	await page.getByRole("link", { name: /Đọc một biểu đồ cột/ }).click();
	await page.getByText("Xem gợi ý và đối chiếu").click();
	await expect(page.getByText(/Kết quả là 6 cuốn/)).toBeVisible();
	await page.getByRole("button", { name: "Đánh dấu đã học" }).click();
	await expect(page.getByText(/Đã ghi nhận/)).toBeVisible();
	await page.getByRole("button", { name: "Bắt đầu làm bài" }).click();
	await page.getByLabel("9 lượt", { exact: true }).check();
	await expect(page.getByText("Đã lưu 1/2 câu")).toBeVisible();
	await page.reload();
	await expect(page.getByLabel("9 lượt", { exact: true })).toBeChecked();
	await page.getByLabel("20 cuốn sách", { exact: true }).check();
	await expect(page.getByText("Đã lưu 2/2 câu")).toBeVisible();
	await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
	await page.getByRole("button", { name: "Xác nhận nộp" }).click();
	await expect(
		page.getByRole("heading", { name: "Kết quả · 2/2 điểm" }),
	).toBeVisible();
	await page.reload();
	await expect(
		page.getByRole("heading", { name: "Kết quả · 2/2 điểm" }),
	).toBeVisible();
});
test("teacher drafts and a separate editor publishes", async ({
	page,
}, info) => {
	const title = `Luyện đọc bảng ${info.project.name}`;
	await login(page, "teacher", info.project.name);
	await page.getByRole("link", { name: "Biên tập", exact: true }).click();
	await page.getByRole("button", { name: "Soạn học liệu" }).click();
	await page.getByLabel("Tiêu đề").fill(title);
	for (const name of [
		"Mục tiêu",
		"Nội dung bài học",
		"Ví dụ",
		"Bài luyện",
		"Gợi ý đối chiếu",
	])
		await page
			.getByLabel(name, { exact: true })
			.fill("Đối chiếu hai giá trị trong cùng một cột.");
	await page.getByRole("button", { name: "Xem trước", exact: true }).click();
	await expect(page.getByRole("heading", { name: title })).toBeVisible();
	await page.getByRole("button", { name: "Lưu bản nháp" }).click();
	await page.getByText(`${title} · v1 · Bản nháp`, { exact: true }).click();
	await page.getByRole("button", { name: "Gửi duyệt" }).click();
	await expect(
		page.getByText(`${title} · v1 · Chờ duyệt`, { exact: true }),
	).toBeVisible();
	await page.getByRole("button", { name: "Đăng xuất" }).click();
	await expect(
		page.getByRole("link", { name: /Đăng nhập/ }).first(),
	).toBeVisible();
	await login(page, "editor", info.project.name);
	await page.getByRole("link", { name: "Biên tập", exact: true }).click();
	await page.getByText(`${title} · v1 · Chờ duyệt`, { exact: true }).click();
	await page.getByRole("button", { name: "Duyệt và xuất bản" }).click();
	await expect(
		page.getByText(`${title} · v1 · Đã xuất bản`, { exact: true }),
	).toBeVisible();
	await page.getByRole("link", { name: "Thư viện", exact: true }).click();
	await expect(page.getByRole("heading", { name: title })).toBeVisible();
});
