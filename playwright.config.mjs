import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  reporter: [["line"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "python scripts/prepare_frontend_assets.py && python app/server.py --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
