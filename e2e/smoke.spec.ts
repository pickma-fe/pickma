import { test, expect } from '@playwright/test';

const TEST_LOCATION = JSON.stringify({
  lat: 37.5654,
  lng: 126.9031,
  address: '서울 마포구',
  savedAt: Date.now(),
});

test('홈 접속', async ({ page }) => {
  await page.addInitScript((location) => {
    localStorage.setItem('pickma_user_location', location);
  }, TEST_LOCATION);
  await page.goto('/');
  await expect(page).toHaveURL('/');
});
