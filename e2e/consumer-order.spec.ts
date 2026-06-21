import { test, expect } from './fixtures/auth';
import { waitForPaymentPopupAndComplete } from './helpers/payment';

const E2E_PRODUCT_ID = '00000000-0000-4000-8000-000000000e01';

test('상품 상세 → 주문 → 결제 팝업 → 완료', async ({ consumerPage: page }) => {
  // 픽업 슬롯(10:00~22:00)이 시간대에 따라 모두 만료되지 않도록 오늘 자정으로 고정
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  await page.clock.install({ time: todayMidnight });

  await page.goto(`/products/${E2E_PRODUCT_ID}`);

  // 첫 번째 사용 가능한 픽업 슬롯 선택 (hydration 후 clock 00:00 기준으로 enabled)
  const firstSlot = page
    .getByRole('button', { name: /^\d{2}:\d{2}~\d{2}:\d{2}$/ })
    .first();
  await expect(firstSlot).toBeEnabled({ timeout: 10_000 });
  await firstSlot.click();

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
