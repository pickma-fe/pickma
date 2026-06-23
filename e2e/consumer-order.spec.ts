import { test, expect } from './fixtures/auth';
import { waitForPaymentPopupAndComplete } from './helpers/payment';

const E2E_PRODUCT_ID = '00000000-0000-4000-8000-000000000e01';

test('상품 상세 → 주문 → 결제 팝업 → 완료', async ({ consumerPage: page }) => {
  // goto 이전에 클록 설치 — hydration 시점부터 noon 기준으로 슬롯 disabled 계산
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);
  await page.clock.install({ time: noon });

  await page.goto(`/products/${E2E_PRODUCT_ID}`);

  // useEffect가 Playwright clock 기준 noon으로 실행 → 12:30 이후 슬롯 활성화
  const targetSlot = page.getByRole('button', { name: '12:30~13:00' });
  await expect(targetSlot).not.toBeDisabled({ timeout: 10_000 });
  await targetSlot.click();

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
