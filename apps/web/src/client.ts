import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
const env = import.meta.env;
export const auth =
	env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY
		? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)
		: null;
export function useIdentity() {
	const [identity, set] = useState<string | null | undefined>(
		auth ? undefined : null,
	);
	useEffect(() => {
		if (!auth) return;
		const { data } = auth.auth.onAuthStateChange((_event, session) =>
			set(session?.user.id ?? null),
		);
		return () => data.subscription.unsubscribe();
	}, []);
	return identity;
}
export async function api<T>(
	path: string,
	data?: unknown,
	method?: string,
): Promise<T> {
	const token = path.startsWith("/me/")
		? (await auth?.auth.getSession())?.data.session?.access_token
		: null;
	const response = await fetch((env.VITE_API_BASE || "/api/v1") + path, {
		method: method || (data === undefined ? "GET" : "POST"),
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(data !== undefined ? { "Content-Type": "application/json" } : {}),
		},
		body: data === undefined ? undefined : JSON.stringify(data),
	});
	const result = await response.json().catch(() => null);
	if (!response.ok || !result)
		throw Error(result?.error || "Không kết nối được với máy chủ học tập.");
	return result;
}
export function useResource<T>(path: string | null, refresh = 0) {
	const [state, set] = useState<{ key: string; data?: T; error?: string }>({
		key: "",
	});
	const key = `${path}#${refresh}`;
	useEffect(() => {
		let active = true;
		if (path)
			api<T>(path)
				.then((data) => {
					if (active) set({ key, data });
				})
				.catch((e) => {
					if (active) set({ key, error: e.message });
				});
		return () => {
			active = false;
		};
	}, [path, key]);
	return state.key === key ? state : { data: undefined, error: undefined };
}
