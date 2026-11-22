import assert from "node:assert/strict";
const base = process.argv[2];
const response = await fetch(`${base}/catalog`, {
	signal: AbortSignal.timeout(15000),
});
assert.equal(response.status, 200);
const lessons = await response.json();
assert.ok(
	lessons.length > 0 &&
		lessons.every(
			(l) => typeof l.title === "string" && typeof l.course === "string",
		),
);
const detail = await fetch(`${base}/lessons/${lessons[0].id}`);
assert.equal(detail.status, 200);
assert.ok((await detail.json()).body.objective);
console.log("Đã đọc danh mục và nội dung bài học.");
