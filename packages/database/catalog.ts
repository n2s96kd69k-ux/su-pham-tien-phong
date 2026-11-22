import {
	pgTable,
	text,
	uuid,
	integer,
	QueryBuilder,
} from "drizzle-orm/pg-core";
import { and, desc, eq, sql } from "drizzle-orm";
const courses = pgTable("courses", {
	id: text().primaryKey(),
	title: text().notNull(),
	subject: text().notNull(),
});
const versions = pgTable("content_versions", {
	id: uuid().primaryKey(),
	series: uuid().notNull(),
	version: integer().notNull(),
	course_id: text().notNull(),
	title: text().notNull(),
	kind: text().notNull(),
	state: text().notNull(),
});
export const publishedLessons = new QueryBuilder()
	.selectDistinctOn([versions.series], {
		id: versions.id,
		title: versions.title,
		version: versions.version,
		subject: courses.subject,
		course: sql<string>`${courses.title}`.as("course"),
	})
	.from(versions)
	.innerJoin(courses, eq(courses.id, versions.course_id))
	.where(and(eq(versions.kind, "lesson"), eq(versions.state, "published")))
	.orderBy(versions.series, desc(versions.version));
