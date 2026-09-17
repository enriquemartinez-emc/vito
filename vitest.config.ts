import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // No test files exist yet — first real specs land with core/ in the next task.
    passWithNoTests: true,
  },
})
