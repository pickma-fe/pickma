import { test, expect } from './fixtures/auth';

const E2E_ORDER_NUMBER = 'E2E-SELLER-00000001';

test('판매자 주문 목록 진입 및 seed 주문 확인', async ({
  sellerPage: page,
}) => {
  await page.goto('/seller/orders');

  await expect(page.getByRole('main')).toBeVisible();

  // seed된 reserved 주문이 목록에 표시됨 확인
  await expect(page.getByText(E2E_ORDER_NUMBER, { exact: true })).toBeVisible({
    timeout: 10_000,
  });

  // 수락 대기 상태 badge 확인
  await expect(page.getByText('수락 대기').first()).toBeVisible({
    timeout: 10_000,
  });
});
