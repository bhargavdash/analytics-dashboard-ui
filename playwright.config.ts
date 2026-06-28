import { defineConfig, devices } from '@playwright/test'

// E2E config.
//
// `webServer` boots the Vite dev server automatically for the test run. The BACKEND is NOT
// started here — it must already be running (see README "Running E2E"). The default backend
// origin is http://localhost:8001 (the project default, baked into VITE_API_BASE_URL's
// fallback); override with the API_BASE_URL env var if you run the API elsewhere.
//
//   Terminal 1:  cd analytics-dashboard-api && uvicorn app.main:app --port 8001
//   Terminal 2:  cd analytics-dashboard-ui  && npx playwright test
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8001/api/v1'

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false, // the tests share one backend + SQLite store; keep them serial
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    timeout: 90_000, // streaming answers + a real LLM round-trip can take a while
    expect: { timeout: 30_000 },
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        actionTimeout: 15_000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: { VITE_API_BASE_URL: API_BASE_URL },
    },
})
