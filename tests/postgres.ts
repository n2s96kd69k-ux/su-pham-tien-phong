import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { connect } from "../apps/api/src/db";
import { migrate } from "../scripts/migrate";
export async function database(port: number) {
	const directory = await mkdtemp(join(tmpdir(), "sptp-pg-"));
	const password = randomUUID();
	const pg = new EmbeddedPostgres({
		databaseDir: directory,
		port,
		password,
		user: "test_user",
		persistent: false,
		authMethod: "scram-sha-256",
		autoRehydrateSymlinks: true,
		postgresFlags: ["-h", "127.0.0.1", "-k", directory],
		onLog: () => {},
	});
	await pg.initialise();
	await pg.start();
	const url = `postgresql://test_user:${password}@127.0.0.1:${port}/postgres`;
	try {
		await migrate(url);
		const db = connect(url, 8);
		return {
			db,
			url,
			stop: async () => {
				await db.end();
				await pg.stop();
			},
		};
	} catch (e) {
		await pg.stop();
		throw e;
	}
}
