import { createApp } from "./app";
import { services } from "./config";
import { connect } from "./db";
type Bindings = {
	HYPERDRIVE?: { connectionString: string };
	SUPABASE_URL?: string;
	WEB_ORIGIN?: string;
};
export default {
	async fetch(
		request: Request,
		env: Bindings,
		ctx: { waitUntil(p: Promise<unknown>): void },
	) {
		const db = env.HYPERDRIVE
			? connect(env.HYPERDRIVE.connectionString, 1)
			: undefined;
		try {
			return await createApp({ ...services(env), db }).fetch(request);
		} finally {
			if (db) ctx.waitUntil(db.end());
		}
	},
};
