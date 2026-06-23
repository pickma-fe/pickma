import { test, expect } from './fixtures/auth';
import { waitForPaymentPopupAndComplete } from './helpers/payment';

const E2E_PRODUCT_ID = '00000000-0000-4000-8000-000000000e01';

test('상품 상세 → 주문 → 결제 팝업 → 완료', async ({ consumerPage: page }) => {
  await page.goto(`/products/${E2E_PRODUCT_ID}`);

  // SSR 완료 대기
  await expect(
    page.getByRole('button', { name: /^\d{2}:\d{2}~\d{2}:\d{2}$/ }).first()
  ).toBeVisible({ timeout: 10_000 });

  // SSR 이후 브라우저 Date를 정오로 고정해 슬롯 disabled 재계산을 보장한다
  // setFixedTime은 리렌더 간 지속이 불안정하므로 Proxy로 영구 패치한다
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);
  const noonMs = noon.getTime();
  await page.evaluate((ms) => {
    const D = window.Date;
    Object.defineProperty(window, 'Date', {
      configurable: true,
      writable: true,
      value: new Proxy(D, {
        construct: (_, args) =>
          args.length ? Reflect.construct(D, args) : new D(ms),
        get: (_, p, r) => (p === 'now' ? () => ms : Reflect.get(D, p, r)),
      }),
    });
  }, noonMs);
  await page.getByRole('button', { name: '수량 증가' }).click();

  // 정오 기준 유효한 슬롯 선택 (12:30은 noon 이후가 아니므로 항상 활성화)
  // 첫 번째 non-disabled 슬롯이 아닌 고정 슬롯을 사용해 오전 슬롯 선택 방지
  const targetSlot = page.getByRole('button', { name: '12:30~13:00' });
  await expect(targetSlot).not.toBeDisabled({ timeout: 5_000 });
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
