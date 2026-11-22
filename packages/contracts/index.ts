import { z } from "zod";
export const role = z.enum(["learner", "teacher", "editor", "admin"]);
export const lessonBody = z.object({
	objective: z.string().trim().min(1).max(1000),
	reading: z.string().trim().min(1).max(12000),
	example: z.string().trim().min(1).max(4000),
	practice: z.string().trim().min(1).max(2000),
	hint: z.string().trim().min(1).max(2000),
});
export const questionBody = z
	.object({
		options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
		correct: z.number().int().nonnegative(),
		explanation: z.string().trim().min(1).max(2000),
	})
	.refine((q) => q.correct < q.options.length);
const common = {
	title: z.string().trim().min(3).max(300),
	course_id: z.string().min(1).max(80),
	previous: z.uuid().optional(),
};
export const draft = z.discriminatedUnion("kind", [
	z.object({ ...common, kind: z.literal("lesson"), body: lessonBody }),
	z.object({ ...common, kind: z.literal("question"), body: questionBody }),
]);
export interface CatalogItem {
	id: string;
	title: string;
	subject: string;
	course: string;
	version: number;
}
export interface Lesson extends CatalogItem {
	sample: boolean;
	body: z.infer<typeof lessonBody>;
	exams: { id: string; title: string; minutes: number; count: number }[];
}
export interface Attempt {
	id: string;
	title: string;
	deadline: string;
	server_now: string;
	submitted_at: string | null;
	answers: Record<string, number>;
	revision: number;
	score: number | null;
	total: number | null;
	items: {
		id: string;
		title: string;
		options: string[];
		correct?: number;
		explanation?: string;
	}[];
}
export interface Profile {
	id: string;
	role: z.infer<typeof role>;
}
export interface History {
	attempts: {
		id: string;
		title: string;
		score: number | null;
		total: number | null;
		started_at: string;
	}[];
	lessons: Pick<CatalogItem, "id" | "title" | "version">[];
}
export interface StudioItem {
	id: string;
	series: string;
	kind: "lesson" | "question";
	version: number;
	title: string;
	state: string;
	author: string | null;
	course_id: string;
	body: z.infer<typeof lessonBody> | z.infer<typeof questionBody>;
}
