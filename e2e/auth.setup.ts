import fs from 'fs/promises';
import path from 'path';

import { type Page, test, expect } from '@playwright/test';

const AUTH_DIR = path.resolve(__dirname, '.auth');

test.beforeAll(async () => {
  await fs.mkdir(AUTH_DIR, { recursive: true });
});

async function signInWithEmail(page: Page, email: string, password: string) {
  await page.goto('/?auth=required');

  const loginDialog = page.getByRole('dialog', { name: '로그인' });
  await loginDialog.getByLabel('이메일').fill(email);
  await loginDialog.getByLabel('비밀번호').fill(password);
  const signInResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/v1/token') &&
      response.request().method() === 'POST',
    { timeout: 10_000 }
  );
  await loginDialog
    .getByRole('button', { name: '로그인', exact: true })
    .click();
  const signInResponse = await signInResponsePromise;
  const signInBody = (await signInResponse.json()) as Record<string, unknown>;

  if (!signInResponse.ok()) {
    throw new Error(
      `Supabase sign-in failed. Status: ${signInResponse.status()}, body: ${JSON.stringify(
        signInBody
      )}`
    );
  }

  await expect(loginDialog).toBeHidden({ timeout: 10_000 });
}

async function expectSignedInUser(
  page: Page,
  expectedRole: 'customer' | 'seller' | 'admin'
) {
  type AuthCheck = {
    ok: boolean;
    status: number;
    role?: string;
    userStatus?: string;
    error?: unknown;
    cookieNames: string[];
    localStorageKeys: string[];
  };

  let lastAuthCheck: AuthCheck | undefined;
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    lastAuthCheck = await page.evaluate(async () => {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      const body = (await res.json()) as {
        data?: { role?: string; status?: string };
        error?: unknown;
      };
      const cookieNames = document.cookie
        .split(';')
        .map((cookie) => cookie.trim().split('=')[0])
        .filter(Boolean);

      return {
        ok: res.ok,
        status: res.status,
        role: body.data?.role,
        userStatus: body.data?.status,
        error: body.error,
        cookieNames,
        localStorageKeys: Object.keys(localStorage),
      };
    });

    if (
      lastAuthCheck.ok &&
      lastAuthCheck.status === 200 &&
      lastAuthCheck.role === expectedRole &&
      lastAuthCheck.userStatus === 'active'
    ) {
      return;
    }

    await page.waitForTimeout(250);
  }

  throw new Error(
    `Expected signed-in ${expectedRole} user. Last auth check: ${JSON.stringify(
      lastAuthCheck
    )}`
  );
}

test('consumer auth setup', async ({ page }) => {
  const email = process.env.E2E_CONSUMER_EMAIL;
  const password = process.env.E2E_CONSUMER_PASSWORD;
  if (!email || !password)
    throw new Error('E2E_CONSUMER_EMAIL / E2E_CONSUMER_PASSWORD not set');

  await signInWithEmail(page, email, password);
  await expectSignedInUser(page, 'customer');

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'consumer.json') });
});

test('seller auth setup', async ({ page }) => {
  const email = process.env.E2E_SELLER_EMAIL;
  const password = process.env.E2E_SELLER_PASSWORD;
  if (!email || !password)
    throw new Error('E2E_SELLER_EMAIL / E2E_SELLER_PASSWORD not set');

  await signInWithEmail(page, email, password);
  await expectSignedInUser(page, 'seller');

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'seller.json') });
});

test('admin auth setup', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error('E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set');

  await signInWithEmail(page, email, password);
  await expectSignedInUser(page, 'admin');

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'admin.json') });
});
