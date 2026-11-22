import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const {
	VITE_API_BASE: api,
	VITE_SUPABASE_URL: supabase,
	VITE_SUPABASE_PUBLISHABLE_KEY: key,
	WEB_ORIGIN: origin,
	HYPERDRIVE_ID: id,
} = process.env;
for (const url of [api, supabase, origin])
	assert.equal(new URL(url).protocol, "https:");
assert.equal(new URL(origin).origin, origin);
assert.ok(api.endsWith("/api/v1"));
assert.match(id, /^[0-9a-f]{32}$/i);
assert.ok(
	key?.startsWith("sb_publishable_"),
	"Use the Supabase publishable key",
);
await mkdir(".local", { recursive: true });
await writeFile(
	".local/staging.json",
	JSON.stringify({
		name: "su-pham-tien-phong-staging",
		main: "../apps/api/src/worker.ts",
		compatibility_date: "2026-01-15",
		compatibility_flags: ["nodejs_compat"],
		workers_dev: true,
		hyperdrive: [{ binding: "HYPERDRIVE", id }],
		vars: { WEB_ORIGIN: origin, SUPABASE_URL: supabase },
	}),
);
