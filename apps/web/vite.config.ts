import { defineConfig, loadEnv } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		root: "apps/web",
		plugins: [
			{
				name: "font-licenses",
				generateBundle() {
					for (const name of ["newsreader", "be-vietnam-pro"]) {
						this.emitFile({
							type: "asset",
							fileName: `licenses/${name}.txt`,
							source: readFileSync(
								resolve("node_modules/@fontsource", name, "LICENSE"),
								"utf8",
							),
						});
					}
				},
			},
		],
		envDir: process.cwd(),
		base: "./",
		server: {
			proxy: { "/api": env.DEV_API_TARGET || "http://127.0.0.1:8787" },
		},
		build: { outDir: resolve("dist/web"), emptyOutDir: true },
	};
});
