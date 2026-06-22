import { test, expect } from './fixtures/auth';
import { waitForPaymentPopupAndComplete } from './helpers/payment';

const E2E_PRODUCT_ID = '00000000-0000-4000-8000-000000000e01';

test('상품 상세 → 주문 → 결제 팝업 → 완료', async ({ consumerPage: page }) => {
  await page.goto(`/products/${E2E_PRODUCT_ID}`);

  // 활성화된 첫 번째 픽업 슬롯 선택 (seed: 00:30~23:30, CI 실행 시간과 무관)
  const firstAvailableSlot = page
    .getByRole('button', {
      name: /^\d{2}:\d{2}~\d{2}:\d{2}$/,
      disabled: false,
    })
    .first();
  await expect(firstAvailableSlot).toBeVisible({ timeout: 10_000 });
  await firstAvailableSlot.click();

  // 담기 버튼 클릭 → 주문 페이지 진입
  await page.getByRole('button', { name: /원 담기/ }).click();
  await expect(page).toHaveURL(/\/order\//, { timeout: 10_000 });

  // 주문 페이지에서 결제 팝업 흐름
  const completedUrl = await waitForPaymentPopupAndComplete(
    page,
    async () => {
      await page.getByRole('button', { name: /원 결제하기/ }).click();
    },
    { timeout: 30_000 }
  );

  expect(completedUrl).toContain('/order/complete');
});
