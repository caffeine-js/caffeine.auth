import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
	test: {
		globals: true,
		env: loadEnv(mode, process.cwd(), ""),
		coverage: {
			exclude: ["src/index.ts", "src/**/*.test.ts", "**/*.d.ts"],
		},
	},
	plugins: [tsConfigPaths()],
}));
