import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerOnboardingStatusResponse } from '@/contracts/seller-application';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerOnboardingStatus } from '@/mocks/seller';

import { toSellerOnboardingStatusResponse } from './_lib/mapper';
import { getSellerOnboardingStatus } from './_lib/service';
import { GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getSellerOnboardingStatus: vi.fn(),
}));

vi.mock('./_lib/mapper', () => ({
  toSellerOnboardingStatusResponse: vi.fn((data) => data),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';

const activeUserResult = {
  authUser: { id: USER_ID },
  serviceUser: {},
} as unknown as Awaited<ReturnType<typeof requireActiveUser>>;

describe('GET /api/seller/onboarding-status', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockSellerOnboardingStatus를 반환하고 auth를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET();
    const body = (await res.json()) as {
      data: SellerOnboardingStatusResponse;
    };

    expect(res.status).toBe(200);
    expect(body.data).toEqual(mockSellerOnboardingStatus);
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('real 모드에서 requireActiveUser 호출 후 authUser.id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(getSellerOnboardingStatus).mockResolvedValue(
      mockSellerOnboardingStatus
    );
    vi.mocked(toSellerOnboardingStatusResponse).mockReturnValue(
      mockSellerOnboardingStatus
    );

    const res = await GET();

    expect(res.status).toBe(200);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(getSellerOnboardingStatus).toHaveBeenCalledWith(USER_ID);
    expect(toSellerOnboardingStatusResponse).toHaveBeenCalledOnce();
  });

  it('requireActiveUser가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
