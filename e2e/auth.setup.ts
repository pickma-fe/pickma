import fs from 'fs/promises';
import path from 'path';

import { test, expect } from '@playwright/test';

const AUTH_DIR = path.resolve(__dirname, '.auth');

test.beforeAll(async () => {
  await fs.mkdir(AUTH_DIR, { recursive: true });
});

test('consumer auth setup', async ({ page }) => {
  const email = process.env.E2E_CONSUMER_EMAIL;
  const password = process.env.E2E_CONSUMER_PASSWORD;
  if (!email || !password)
    throw new Error('E2E_CONSUMER_EMAIL / E2E_CONSUMER_PASSWORD not set');

  await page.goto('/?auth=required');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

  const res = await page.request.get('/api/users/me');
  const body = await res.json();
  expect(body.data?.role).toBe('customer');
  expect(body.data?.status).toBe('active');

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'consumer.json') });
});

test('seller auth setup', async ({ page }) => {
  const email = process.env.E2E_SELLER_EMAIL;
  const password = process.env.E2E_SELLER_PASSWORD;
  if (!email || !password)
    throw new Error('E2E_SELLER_EMAIL / E2E_SELLER_PASSWORD not set');

  await page.goto('/?auth=required');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

  const res = await page.request.get('/api/users/me');
  const body = await res.json();
  expect(body.data?.role).toBe('seller');
  expect(body.data?.status).toBe('active');

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'seller.json') });
});

test('admin auth setup', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error('E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set');

  await page.goto('/?auth=required');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

  const res = await page.request.get('/api/users/me');
  const body = await res.json();
  expect(body.data?.role).toBe('admin');
  expect(body.data?.status).toBe('active');

  await page
    .context()
    .storageState({ path: path.join(AUTH_DIR, 'admin.json') });
});
