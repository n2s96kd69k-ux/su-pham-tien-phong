import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:4173/su-pham-tien-phong/";
const files = await readdir("dist/web", { recursive: true });
assert.ok(files.includes("index.html"));
assert.ok(
	!files.some((name) => /(?:^|\/)README(?:\.md)?$|\.(?:tsx?|map)$/i.test(name)),
);

const browser = await chromium.launch({
	executablePath: process.env.CHROMIUM_PATH,
});
try {
	const page = await browser.newPage();
	const assets = [];
	page.on("response", (response) => {
		if (["script", "stylesheet"].includes(response.request().resourceType()))
			assets.push(response);
	});
	await page.goto(base);
	await page.waitForURL(base + "#/catalog");
	await page.getByRole("link", { name: "Đăng nhập" }).click();
	await page.reload();
	await page.getByRole("heading", { name: "Đăng nhập", exact: true }).waitFor();
	assert.equal(page.url(), base + "#/login");
	for (const type of ["script", "stylesheet"]) {
		assert.ok(assets.some((asset) => asset.request().resourceType() === type));
	}
	assert.ok(
		assets.every(
			(asset) => asset.ok() && asset.url().startsWith(base + "assets/"),
		),
	);
} finally {
	await browser.close();
}
