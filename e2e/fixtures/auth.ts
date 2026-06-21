import path from 'path';

import { type Page, test as base, expect } from '@playwright/test';

const AUTH_DIR = path.resolve(__dirname, '../.auth');

export const test = base.extend<{
  consumerPage: Page;
  sellerPage: Page;
  adminPage: Page;
}>({
  consumerPage: async ({ browser, contextOptions, baseURL }, apply) => {
    if (!baseURL) throw new Error('baseURL is not configured');
    const context = await browser.newContext({
      ...contextOptions,
      baseURL,
      storageState: path.join(AUTH_DIR, 'consumer.json'),
    });
    const page = await context.newPage();
    await apply(page);
    await context.close();
  },

  sellerPage: async ({ browser, contextOptions, baseURL }, apply) => {
    if (!baseURL) throw new Error('baseURL is not configured');
    const context = await browser.newContext({
      ...contextOptions,
      baseURL,
      storageState: path.join(AUTH_DIR, 'seller.json'),
    });
    const page = await context.newPage();
    await apply(page);
    await context.close();
  },

  adminPage: async ({ browser, contextOptions, baseURL }, apply) => {
    if (!baseURL) throw new Error('baseURL is not configured');
    const context = await browser.newContext({
      ...contextOptions,
      baseURL,
      storageState: path.join(AUTH_DIR, 'admin.json'),
    });
    const page = await context.newPage();
    await apply(page);
    await context.close();
  },
});

export { expect };
