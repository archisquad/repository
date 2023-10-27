import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    alias: {
      "@": "./src",
    },
    include: ["src/**/*.{test,unit,integration}.{ts,tsx}"],
    environment: "node",
    setupFiles: ["vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 80,
    },
    typecheck: {
      enabled: true,
    },
  },
})
