import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: fileURLToPath(new URL("./tests/global.ts", import.meta.url)),
    threads: false, // fixes the inconsistent test result
  },
});
