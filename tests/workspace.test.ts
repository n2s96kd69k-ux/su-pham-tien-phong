import { beforeAll, afterAll, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { database } from "./postgres";
import { createApp } from "../apps/api/src/app";
import { grade } from "../apps/api/src/exams";
import { migrate } from "../scripts/migrate";
const learner: string = randomUUID(),
	other = randomUUID(),
	teacher = randomUUID(),
	editor = randomUUID();
const lesson = "00000000-0000-4000-8000-000000000101",
	exam = "00000000-0000-4000-8000-000000000301";
let ctx: Awaited<ReturnType<typeof database>>,
	app: ReturnType<typeof createApp>;
beforeAll(async () => {
	ctx = await database(55521);
	app = createApp({
		db: ctx.db,
		verify: async (token) => {
			if (![learner, other, teacher, editor].includes(token)) throw Error();
			return token;
		},
		tutor: async () => "So sánh hai số đếm.",
	});
	await ctx.db`INSERT INTO profiles VALUES (${teacher},'teacher'),(${editor},'editor')`;
});
afterAll(async () => {
	await ctx?.stop();
});
async function req(
	path: string,
	who?: string,
	body?: unknown,
	method?: string,
) {
	return app.request(`/api/v1${path}`, {
		method: method || (body === undefined ? "GET" : "POST"),
		headers: {
			...(who ? { Authorization: `Bearer ${who}` } : {}),
			"Content-Type": "application/json",
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}
it("scores only matching options", () => {
	expect(
		grade(
			[
				{ id: "a", correct: 0 },
				{ id: "b", correct: 1 },
			],
			{ a: 0 },
		),
	).toBe(1);
});
it("migrates twice and returns published original lessons", async () => {
	await migrate(ctx.url);
	expect(await (await req("/catalog")).json()).toHaveLength(2);
	expect(
		(await (await req(`/lessons/${lesson}`)).json()).body.objective,
	).toBeTruthy();
});
it("requires identity, protects staff routes and records progress once", async () => {
	expect((await req("/me/profile")).status).toBe(401);
	expect((await req("/me/profile", "invalid")).status).toBe(401);
	expect((await req("/me/studio", learner)).status).toBe(403);
	for (let i = 0; i < 2; i++)
		expect(
			(await req(`/me/lessons/${lesson}/complete`, learner, {})).status,
		).toBe(200);
	expect(
		(await (await req("/me/history", learner)).json()).lessons,
	).toHaveLength(1);
});
it("serializes starts, rejects stale writes, isolates owners and freezes one grade", async () => {
	const begin = () =>
		req(`/me/exams/${exam}/start`, learner, {}).then((r) => r.json());
	const [one, two] = await Promise.all([begin(), begin()]);
	expect(one.id).toBe(two.id);
	const path = `/me/attempts/${one.id}`;
	const open = await (await req(path, learner)).json();
	expect(open.items).toHaveLength(2);
	expect(open.items[0]).not.toHaveProperty("correct");
	expect(open.items[0]).not.toHaveProperty("explanation");
	const answer = { question: open.items[0].id, choice: 1, revision: 0 };
	expect((await req(path, other)).status).toBe(404);
	expect((await req(`${path}/answers`, other, answer, "PUT")).status).toBe(404);
	expect((await req(`${path}/submit`, other, {})).status).toBe(404);
	const saves = await Promise.all([
		req(`${path}/answers`, learner, answer, "PUT"),
		req(`${path}/answers`, learner, answer, "PUT"),
	]);
	expect(saves.map((r) => r.status).sort()).toEqual([200, 409]);
	const resumed = await (await req(path, learner)).json();
	expect(resumed.answers[answer.question]).toBe(1);
	const grades = await Promise.all([
		req(`${path}/submit`, learner, { score: 99 }),
		req(`${path}/submit`, learner, {}),
	]);
	const [a, b] = await Promise.all(grades.map((r) => r.json()));
	expect(a.score).toBe(1);
	expect(a.total).toBe(2);
	expect(a.submitted_at).toBe(b.submitted_at);
	expect(
		(await req(`${path}/answers`, learner, { ...answer, revision: 1 }, "PUT"))
			.status,
	).toBe(409);
	const old =
		await ctx.db`SELECT * FROM content_versions WHERE id=${answer.question}`;
	const q = old[0];
	await ctx.db`INSERT INTO content_versions(series,version,kind,course_id,title,state,body) VALUES (${q.series},2,'question','data',${q.title},'published',${ctx.db.json({ ...q.body, correct: 0 })})`;
	expect((await (await req(path, learner)).json()).items[0].correct).toBe(1);
});
it("uses server time to finalize an expired attempt before saving", async () => {
	const { id } = await (await req(`/me/exams/${exam}/start`, other, {})).json();
	await ctx.db`UPDATE attempts SET deadline=now()-interval '3 seconds' WHERE id=${id}`;
	const row = await (
		await req(
			`/me/attempts/${id}/answers`,
			other,
			{ question: randomUUID(), choice: 0, revision: 0 },
			"PUT",
		)
	).json();
	expect(row.score).toBe(0);
	expect(row.answers).toEqual({});
	expect(row.submitted_at).toBeTruthy();
});
it("publishes drafts only after independent review and audits publication", async () => {
	const input = {
		title: "Kiểm tra giá trị lớn nhất",
		kind: "question",
		course_id: "data",
		body: { options: ["3", "5"], correct: 1, explanation: "5 lớn hơn 3." },
	};
	const { id } = await (await req("/me/studio", teacher, input)).json();
	expect(id).toBeTruthy();
	expect((await req(`/lessons/${id}`)).status).toBe(404);
	expect(
		(
			await req(
				`/me/studio/${id}`,
				teacher,
				{ ...input, title: "Giá trị lớn hơn" },
				"PUT",
			)
		).status,
	).toBe(200);
	expect((await req(`/me/studio/${id}/publish`, editor, {})).status).toBe(409);
	expect((await req(`/me/studio/${id}/review`, teacher, {})).status).toBe(200);
	expect((await req(`/me/studio/${id}/publish`, teacher, {})).status).toBe(403);
	expect((await req(`/me/studio/${id}/publish`, editor, {})).status).toBe(200);
	expect(
		(
			await req("/me/exams", editor, {
				lesson,
				title: "Đề so sánh",
				questions: [id],
				minutes: 4,
			})
		).status,
	).toBe(201);
	expect(await ctx.db`SELECT id FROM audit WHERE resource=${id}`).toHaveLength(
		2,
	);
	await expect(
		ctx.db`UPDATE content_versions SET title='Changed' WHERE id=${id}`,
	).rejects.toThrow("immutable");
});
it("records reports and allows editorial resolution", async () => {
	const { id } = await (
		await req("/me/reports", learner, { lesson, message: "Cần làm rõ đơn vị." })
	).json();
	expect((await req(`/me/reports/${id}/resolve`, learner, {})).status).toBe(
		403,
	);
	expect((await req(`/me/reports/${id}/resolve`, editor, {})).status).toBe(200);
});
it("limits tutor requests per day with a test-only provider", async () => {
	const path = `/me/lessons/${lesson}/hint`;
	for (let i = 0; i < 5; i++)
		expect((await req(path, learner, {})).status).toBe(200);
	expect((await req(path, learner, {})).status).toBe(429);
});
it("reports unavailable services when configuration is absent", async () => {
	const bare = createApp({});
	expect((await (await bare.request("/api/v1/health")).json()).tutor).toBe(
		false,
	);
	expect((await bare.request("/api/v1/catalog")).status).toBe(503);
});
it("keeps a published exam and its item list immutable", async () => {
	await expect(
		ctx.db`UPDATE exams SET minutes=99 WHERE id=${exam}`,
	).rejects.toThrow("immutable");
	await expect(
		ctx.db`DELETE FROM exam_items WHERE exam_id=${exam}`,
	).rejects.toThrow("immutable");
});
