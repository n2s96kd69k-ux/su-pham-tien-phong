import EmbeddedPostgres from "embedded-postgres";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { migrate } from "./migrate";
const base = resolve(".local");
await mkdir(base, { recursive: true, mode: 0o700 });
const keyFile = `${base}/database-password`;
try {
	await writeFile(keyFile, randomBytes(32).toString("hex"), {
		flag: "wx",
		mode: 0o600,
	});
} catch (e) {
	if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
}
const password = await readFile(keyFile, "utf8");
const pg = new EmbeddedPostgres({
	databaseDir: `${base}/pg`,
	port: 55432,
	user: "sptp",
	password,
	authMethod: "scram-sha-256",
	autoRehydrateSymlinks: true,
	postgresFlags: ["-h", "127.0.0.1", "-k", base],
});
if (
	!(await access(`${base}/pg/PG_VERSION`).then(
		() => true,
		() => false,
	))
)
	await pg.initialise();
await pg.start();
const url = `postgresql://sptp:${password}@127.0.0.1:55432/postgres`;
await migrate(url);
await writeFile(`${base}/db.env`, `DATABASE_URL=${url}\n`, { mode: 0o600 });
console.log("PostgreSQL đã sẵn sàng • .local/db.env");
for (const signal of ["SIGTERM", "SIGINT"] as const)
	process.once(signal, () => void pg.stop());
