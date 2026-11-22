import { HTTPException } from "hono/http-exception";
import type { DB } from "./db";
import type { z } from "zod";
import type { draft, Profile } from "../../../packages/contracts";
export function requireStaff(user: Profile, editor = false) {
	if (
		!(editor ? ["editor", "admin"] : ["teacher", "editor", "admin"]).includes(
			user.role,
		)
	)
		throw new HTTPException(403);
}
export async function createDraft(
	db: DB,
	user: Profile,
	input: z.infer<typeof draft>,
) {
	requireStaff(user);
	return db.begin(async (tx) => {
		const [course] =
			await tx`SELECT id FROM courses WHERE id=${input.course_id}`;
		if (!course) throw new HTTPException(400);
		let parent: { series: string } | undefined;
		if (input.previous) {
			[parent] = await tx<
				{ series: string }[]
			>`SELECT series FROM content_versions WHERE id=${input.previous} AND state='published' AND kind=${input.kind} AND (kind='lesson' OR author=${user.id} OR ${user.role !== "teacher"}) FOR SHARE`;
			if (!parent) throw new HTTPException(404);
			await tx`SELECT pg_advisory_xact_lock(hashtextextended(${parent.series},0))`;
		}
		const [row] =
			await tx`INSERT INTO content_versions(series,version,course_id,author,kind,title,body) SELECT coalesce(${parent?.series ?? null}::uuid,gen_random_uuid()),coalesce(max(version),0)+1,${input.course_id},${user.id},${input.kind},${input.title},${tx.json(input.body)} FROM content_versions WHERE series=${parent?.series ?? null} RETURNING id`;
		return row;
	});
}
export async function transition(
	db: DB,
	user: Profile,
	id: string,
	publish: boolean,
) {
	requireStaff(user, publish);
	return db.begin(async (tx) => {
		const [result] =
			await tx`UPDATE content_versions SET state=${publish ? "published" : "review"} WHERE id=${id} AND state=${publish ? "review" : "draft"} AND ${publish ? tx`author <> ${user.id}` : tx`author=${user.id}`} RETURNING id,state`;
		if (!result) throw new HTTPException(409);
		await tx`INSERT INTO audit(actor,action,resource) VALUES (${user.id},${result.state},${id})`;
		return result;
	});
}
export async function createExam(
	db: DB,
	user: Profile,
	data: { title: string; lesson: string; questions: string[]; minutes: number },
) {
	requireStaff(user, true);
	return db.begin(async (tx) => {
		const [lesson] =
			await tx`SELECT course_id FROM content_versions WHERE id=${data.lesson} AND state='published' AND kind='lesson'`;
		if (!lesson) throw new HTTPException(400);
		const questions =
			await tx`SELECT id FROM content_versions WHERE id IN ${tx(data.questions)} AND state='published' AND kind='question' AND course_id=${lesson.course_id}`;
		if (questions.length !== data.questions.length)
			throw new HTTPException(400);
		const [exam] =
			await tx`INSERT INTO exams(lesson_id,title,minutes) VALUES (${data.lesson},${data.title},${data.minutes}) RETURNING id`;
		await tx`INSERT INTO exam_items ${tx(data.questions.map((question_id, i) => ({ question_id, position: i + 1, exam_id: exam.id })))}`;
		await tx`UPDATE exams SET sealed=true WHERE id=${exam.id}`;
		await tx`INSERT INTO audit(actor,action,resource) VALUES (${user.id},'exam_published',${exam.id})`;
		return exam;
	});
}
