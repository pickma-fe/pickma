import path from 'path';

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'public',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'consumer',
      testMatch: /consumer-order\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/consumer.json',
      },
      dependencies: ['auth-setup'],
    },

    {
      name: 'seller',
      testMatch: /seller-orders\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/seller.json',
      },
      dependencies: ['auth-setup'],
    },

    {
      name: 'admin',
      testMatch: /admin-approval\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: process.env.E2E_REUSE_SERVER === 'true',
    env: {
      API_MOCK_ENABLED: process.env.API_MOCK_ENABLED ?? 'false',
      PAYMENT_MOCK: process.env.PAYMENT_MOCK ?? 'true',
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ?? '',
      NEXT_PUBLIC_TOSS_CLIENT_KEY:
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'test_ck_e2e',
      TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY ?? 'test_sk_e2e',
    },
  },
});
