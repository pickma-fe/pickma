import { test, expect } from './fixtures/auth';

const E2E_COMPANY_NAME = 'E2E 테스트 매장';

test('관리자 판매자 승인 페이지 접근 및 신청 목록 확인', async ({
  adminPage: page,
}) => {
  await page.goto('/admin/sellers/pending');

  await expect(page.getByRole('main')).toBeVisible();

  // seed된 pending 신청 row 표시 확인
  await expect(page.getByText(E2E_COMPANY_NAME)).toBeVisible({
    timeout: 10_000,
  });

  // 승인 검토 / 거절 검토 / 상세 보기 버튼 visible 확인
  await expect(
    page.getByRole('button', { name: `${E2E_COMPANY_NAME} 신청 승인 검토` })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: `${E2E_COMPANY_NAME} 신청 거절 검토` })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: `${E2E_COMPANY_NAME} 신청 상세 보기` })
  ).toBeVisible();
});
