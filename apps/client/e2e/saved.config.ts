import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'saved.spec.ts',
  outputDir: '../test-results/saved',
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:5187',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 5187 --strictPort',
    cwd: '..',
    url: 'http://127.0.0.1:5187',
    reuseExistingServer: true,
  },
})
