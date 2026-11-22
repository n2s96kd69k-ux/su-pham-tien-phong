import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { draft, type Profile } from "../../../packages/contracts";
import { type DB, catalog } from "./db";
import { type Verify, profile } from "./auth";
import { start, attempt } from "./exams";
import { requireStaff, createDraft, transition, createExam } from "./studio";
export interface Services {
	db?: DB;
	verify?: Verify;
	origin?: string;
	tutor?: (context: string) => Promise<string>;
}
type Env = { Variables: { user: Profile } };
const messages: Record<number, string> = {
	400: "Dữ liệu gửi lên chưa hợp lệ.",
	401: "Vui lòng đăng nhập lại.",
	403: "Tài khoản chưa có quyền này.",
	404: "Không tìm thấy nội dung.",
	409: "Dữ liệu đã thay đổi. Hãy tải lại để xem bản mới nhất.",
	413: "Nội dung quá dài.",
	429: "Đã đạt giới hạn lượt dùng hôm nay.",
	503: "Dịch vụ chưa sẵn sàng. Vui lòng thử lại sau.",
};
const parse = async <T>(c: Context, s: z.ZodType<T>) =>
	s.parse(await c.req.json().catch(() => null));
const id = (value: string | undefined) => z.uuid().parse(value);
export function createApp(services: Services) {
	const app = new Hono<Env>().basePath("/api/v1");
	function db() {
		if (!services.db) throw new HTTPException(503);
		return services.db;
	}
	app.use(
		"*",
		cors({
			origin: services.origin || "",
			allowHeaders: ["Authorization", "Content-Type"],
			allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
		}),
	);
	app.use("*", async (c, next) => {
		c.header("Cache-Control", "no-store");
		c.header("X-Content-Type-Options", "nosniff");
		await next();
	});
	app.use(
		"*",
		bodyLimit({
			maxSize: 64000,
			onError: () => {
				throw new HTTPException(413);
			},
		}),
	);
	app.onError((err, c) => {
		const status =
			err instanceof HTTPException
				? err.status
				: err instanceof z.ZodError
					? 400
					: 500;
		if (status === 500)
			console.error(
				JSON.stringify({
					event: "api_error",
					method: c.req.method,
					route: c.req.routePath,
					name: err.name,
				}),
			);
		return c.json(
			{ error: messages[status] || "Máy chủ gặp lỗi. Vui lòng thử lại." },
			status,
		);
	});
	app.get("/health", (c) =>
		c.json({ status: "ok", auth: !!services.verify, tutor: !!services.tutor }),
	);
	app.get("/catalog", async (c) => c.json(await catalog(db())));
	app.get("/lessons/:id", async (c) => {
		const sql = db();
		const [row] =
			await sql`SELECT v.id,v.title,v.version,v.body,c.subject,c.title AS course FROM content_versions v JOIN courses c ON v.course_id=c.id WHERE v.id=${id(c.req.param("id"))} AND v.state='published' AND v.kind='lesson'`;
		if (!row) throw new HTTPException(404);
		const exams =
			await sql`SELECT e.id,e.title,e.minutes,count(i.position)::int AS count FROM exams e JOIN exam_items i ON i.exam_id=e.id WHERE lesson_id=${row.id} AND e.sealed GROUP BY e.id ORDER BY e.created_at`;
		return c.json({ ...row, exams });
	});
	app.use("/me/*", async (c, next) => {
		if (!services.verify) throw new HTTPException(503);
		const match = /^Bearer (\S+)$/i.exec(c.req.header("Authorization") || "");
		if (!match) throw new HTTPException(401);
		let subject: string;
		try {
			subject = await services.verify(match[1]);
		} catch {
			throw new HTTPException(401);
		}
		c.set("user", await profile(db(), subject));
		await next();
	});
	app.get("/me/profile", (c) => c.json(c.get("user")));
	app.get("/me/history", async (c) => {
		const u = c.get("user").id,
			sql = db();
		return c.json({
			attempts:
				await sql`SELECT a.id,e.title,a.score,a.total,a.started_at FROM attempts a JOIN exams e ON e.id=a.exam_id WHERE owner=${u} ORDER BY started_at DESC`,
			lessons:
				await sql`SELECT v.id,v.title,v.version FROM progress p JOIN content_versions v ON v.id=p.lesson_id WHERE owner=${u} ORDER BY completed_at DESC`,
		});
	});
	app.post("/me/lessons/:id/complete", async (c) => {
		const sql = db(),
			lesson = id(c.req.param("id"));
		const [row] =
			await sql`INSERT INTO progress SELECT ${c.get("user").id},id,now() FROM content_versions WHERE id=${lesson} AND kind='lesson' AND state='published' ON CONFLICT(owner,lesson_id) DO UPDATE SET owner=excluded.owner RETURNING lesson_id`;
		if (!row) throw new HTTPException(404);
		return c.json(row);
	});
	app.post("/me/exams/:id/start", async (c) =>
		c.json(await start(db(), id(c.req.param("id")), c.get("user").id)),
	);
	app.get("/me/attempts/:id", async (c) =>
		c.json(
			await attempt(db(), id(c.req.param("id")), c.get("user").id, {
				type: "read",
			}),
		),
	);
	app.put("/me/attempts/:id/answers", async (c) => {
		const data = await parse(
			c,
			z
				.object({
					question: z.uuid(),
					choice: z.number().int().nonnegative(),
					revision: z.number().int().nonnegative(),
				})
				.strict(),
		);
		return c.json(
			await attempt(db(), id(c.req.param("id")), c.get("user").id, {
				type: "save",
				...data,
			}),
		);
	});
	app.post("/me/attempts/:id/submit", async (c) =>
		c.json(
			await attempt(db(), id(c.req.param("id")), c.get("user").id, {
				type: "submit",
			}),
		),
	);
	app.get("/me/studio", async (c) => {
		const user = c.get("user"),
			sql = db();
		requireStaff(user);
		return c.json(
			await sql`SELECT * FROM content_versions WHERE author=${user.id} OR (state='published' AND (kind='lesson' OR ${user.role !== "teacher"})) OR (${user.role !== "teacher"} AND state='review') ORDER BY title,version DESC`,
		);
	});
	app.post("/me/studio", async (c) =>
		c.json(await createDraft(db(), c.get("user"), await parse(c, draft)), 201),
	);
	app.put("/me/studio/:id", async (c) => {
		const user = c.get("user");
		requireStaff(user);
		const data = await parse(c, draft),
			sql = db();
		const [row] =
			await sql`UPDATE content_versions SET title=${data.title},body=${sql.json(data.body)} WHERE id=${id(c.req.param("id"))} AND author=${user.id} AND state='draft' AND kind=${data.kind} RETURNING id`;
		if (!row) throw new HTTPException(409);
		return c.json(row);
	});
	app.post("/me/studio/:id/:action", async (c) => {
		const action = z.enum(["review", "publish"]).parse(c.req.param("action"));
		return c.json(
			await transition(
				db(),
				c.get("user"),
				id(c.req.param("id")),
				action === "publish",
			),
		);
	});
	app.post("/me/exams", async (c) =>
		c.json(
			await createExam(
				db(),
				c.get("user"),
				await parse(
					c,
					z.object({
						lesson: z.uuid(),
						questions: z.array(z.uuid()).min(1).max(100),
						title: z.string().trim().min(3).max(160),
						minutes: z.number().int().min(1).max(180),
					}),
				),
			),
			201,
		),
	);
	app.post("/me/reports", async (c) => {
		const data = await parse(
				c,
				z.object({
					lesson: z.uuid(),
					message: z.string().trim().min(5).max(800),
				}),
			),
			sql = db();
		const [report] =
			await sql`INSERT INTO reports(owner,lesson_id,message) SELECT ${c.get("user").id},id,${data.message} FROM content_versions WHERE id=${data.lesson} AND kind='lesson' AND state='published' RETURNING id`;
		if (!report) throw new HTTPException(404);
		return c.json(report, 201);
	});
	app.get("/me/reports", async (c) => {
		requireStaff(c.get("user"), true);
		return c.json(
			await db()`SELECT r.id,r.message,r.resolved,v.title FROM reports r JOIN content_versions v ON v.id=r.lesson_id ORDER BY resolved,id`,
		);
	});
	app.post("/me/reports/:id/resolve", async (c) => {
		requireStaff(c.get("user"), true);
		const sql = db();
		return c.json(
			await sql.begin(async (tx) => {
				const [row] =
					await tx`UPDATE reports SET resolved=true WHERE id=${id(c.req.param("id"))} AND NOT resolved RETURNING id`;
				if (!row) throw new HTTPException(409);
				await tx`INSERT INTO audit(actor,action,resource) VALUES (${c.get("user").id},'resolved',${row.id})`;
				return row;
			}),
		);
	});
	app.post("/me/lessons/:id/hint", async (c) => {
		if (!services.tutor) throw new HTTPException(503);
		const sql = db();
		const [row] =
			await sql`SELECT title,body,version FROM content_versions WHERE id=${id(c.req.param("id"))} AND state='published' AND kind='lesson'`;
		if (!row) throw new HTTPException(404);
		await sql.begin(async (tx) => {
			await tx`SELECT pg_advisory_xact_lock(880331)`;
			const [{ total }] =
				await tx`SELECT COALESCE(SUM(requests),0)::int AS total FROM tutor_usage WHERE day=CURRENT_DATE`;
			if (total >= 100) throw new HTTPException(429);
			const used =
				await tx`INSERT INTO tutor_usage VALUES(${c.get("user").id},CURRENT_DATE,1) ON CONFLICT(owner,day) DO UPDATE SET requests=tutor_usage.requests+1 WHERE tutor_usage.requests<5 RETURNING requests`;
			if (!used.length) throw new HTTPException(429);
		});
		try {
			return c.json({
				hint: await services.tutor(
					JSON.stringify({
						title: row.title,
						objective: row.body.objective,
						example: row.body.example,
						practice: row.body.practice,
					}),
				),
				lesson: c.req.param("id"),
				version: row.version,
			});
		} catch {
			throw new HTTPException(503);
		}
	});
	return app;
}
