import postgres from "postgres";
import { publishedLessons } from "../../../packages/database/catalog";
export type DB = ReturnType<typeof postgres>;
export const connect = (url: string, max = 5) =>
	postgres(url, { prepare: false, max, connect_timeout: 6, idle_timeout: 10 });
export function catalog(db: DB) {
	const { sql, params } = publishedLessons.toSQL();
	return db.unsafe(sql, params.map(String));
}
