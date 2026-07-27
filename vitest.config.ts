import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environmentMatchGlobs: [
      ["src/react/**/*.test.tsx", "jsdom"],
      ["src/react-router/**/*.test.tsx", "jsdom"],
    ],
  },
});
