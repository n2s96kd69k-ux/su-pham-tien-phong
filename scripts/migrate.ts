import postgres from "postgres";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
export async function migrate(url: string) {
	const sql = postgres(url, { max: 1 });
	try {
		await sql.begin(async (tx) => {
			await tx`SELECT pg_advisory_xact_lock(517210)`;
			await tx`CREATE TABLE IF NOT EXISTS migrations(name text PRIMARY KEY, checksum text NOT NULL)`;
			const dir = new URL("../packages/database/", import.meta.url);
			for (const name of (await readdir(dir))
				.filter((n) => n.endsWith(".sql"))
				.sort()) {
				const source = await readFile(new URL(name, dir), "utf8");
				const checksum = createHash("sha256").update(source).digest("hex");
				const [old] =
					await tx`SELECT checksum FROM migrations WHERE name=${name}`;
				if (old) {
					if (old.checksum !== checksum)
						throw new Error(`Migration đã thay đổi: ${name}`);
					continue;
				}
				await tx.unsafe(source).simple();
				await tx`INSERT INTO migrations VALUES (${name},${checksum})`;
			}
		});
	} finally {
		await sql.end();
	}
}
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
	if (!process.env.DATABASE_URL) throw new Error("Cần DATABASE_URL");
	await migrate(process.env.DATABASE_URL);
}
