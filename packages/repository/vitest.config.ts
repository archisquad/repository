import tsconfigPaths from "vite-tsconfig-paths"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  // Types incompatibility between vite-tsconfig-paths and vite 5.0.2
  plugins: [tsconfigPaths() as any],
  test: {
    include: ["src/**/*.{test,unit,integration}.{ts,tsx}"],
    environment: "node",
    setupFiles: ["vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      exclude: [...(configDefaults.coverage?.exclude ?? []), "**/*.test-d.ts"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
    typecheck: {
      enabled: true,
    },
  },
})
