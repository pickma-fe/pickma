import { test, expect } from '@playwright/test';

const LOCATION_PAYLOAD = JSON.stringify({
  lat: 37.5654,
  lng: 126.9031,
  address: '서울 마포구',
  savedAt: Date.now(),
});

const SMOKE_PRODUCT_ID = '00000000-0000-4000-8000-000000000e01';

test('홈 접속 및 상품 목록 표시', async ({ page }) => {
  await page.addInitScript((location) => {
    localStorage.setItem('pickma_user_location', location);
  }, LOCATION_PAYLOAD);
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page
      .locator('article, [data-testid="product-card"], a[href*="/products/"]')
      .first()
  ).toBeVisible({
    timeout: 15_000,
  });
});

test('상품 상세 진입', async ({ page }) => {
  await page.goto(`/products/${SMOKE_PRODUCT_ID}`);
  await expect(page.getByRole('main')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading').first()).toBeVisible({
    timeout: 10_000,
  });
});
