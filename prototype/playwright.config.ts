import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright E2E Automation Testing SIJAKON Kab. Bogor
 * Target: https://prototype-bogor.vercel.app / http://localhost:3000
 */
export default defineConfig({
  testDir: './e2e/specs',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false,
  workers: 1, // Berurutan agar tidak terjadi race condition saat menguji perubahan data di live app
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'https://prototype-bogor.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1366, height: 768 },
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Chromium Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
});
