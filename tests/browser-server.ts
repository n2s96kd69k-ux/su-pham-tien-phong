// Loopback-only identity fixture used by Playwright. Never included in either deployment entrypoint.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { createApp } from "../apps/api/src/app";
import { verifier } from "../apps/api/src/auth";
import { database } from "./postgres";
import { createServer } from "vite";
import { randomUUID } from "node:crypto";
const fixture = await database(55522),
	issuer = "http://127.0.0.1:5181/auth/v1";
const authority = new Hono();
authority.use("*", cors({ origin: "http://127.0.0.1:5180" }));
const keys = await generateKeyPair("ES256"),
	jwk = {
		...(await exportJWK(keys.publicKey)),
		kid: "browser-test",
		alg: "ES256",
	};
authority.get("/auth/v1/.well-known/jwks.json", (c) => c.json({ keys: [jwk] }));
const identities = new Map<string, string>();
authority.post("/auth/v1/token", async (c) => {
	const { email, password } = await c.req.json();
	if (
		!/^(learner|teacher|editor)-(desktop|mobile)@example\.test$/.test(email) ||
		password !== "playwright-only"
	)
		return c.json({ error: "invalid_grant" }, 400);
	const sub = identities.get(email) || randomUUID();
	identities.set(email, sub);
	const role = email.split("-")[0];
	await fixture.db`INSERT INTO profiles VALUES (${sub},${role}) ON CONFLICT DO NOTHING`;
	const token = await new SignJWT({ role: "authenticated" })
		.setSubject(sub)
		.setAudience("authenticated")
		.setIssuer(issuer)
		.setProtectedHeader({ alg: "ES256", kid: "browser-test" })
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(keys.privateKey);
	return c.json({
		access_token: token,
		token_type: "bearer",
		expires_in: 3600,
		refresh_token: randomUUID(),
		user: {
			id: sub,
			aud: "authenticated",
			email,
			app_metadata: {},
			user_metadata: {},
			created_at: new Date().toISOString(),
		},
	});
});
authority.post("/auth/v1/logout", (c) => c.body(null, 204));
authority.route("/", createApp({ db: fixture.db, verify: verifier(issuer) }));
const server = serve({
	fetch: authority.fetch,
	hostname: "127.0.0.1",
	port: 5181,
});
process.env.VITE_SUPABASE_URL = "http://127.0.0.1:5181";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "browser-fixture";
process.env.VITE_API_BASE = "/api/v1";
process.env.DEV_API_TARGET = "http://127.0.0.1:5181";
const web = await createServer({
	configFile: "apps/web/vite.config.ts",
	server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
await web.listen();
async function stop() {
	await web.close();
	server.close();
	await fixture.stop();
}
process.once("SIGTERM", stop);
process.once("SIGINT", stop);
