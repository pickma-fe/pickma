import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerApplicationResponse } from '@/contracts/seller-application';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import {
  checkApplicationEligibility,
  requireActiveUser,
} from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerApplication } from '@/mocks/seller';

import { createSellerApplication } from './_lib/service';
import { POST } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
  checkApplicationEligibility: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  createSellerApplication: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';

const activeUserResult = {
  authUser: { id: USER_ID },
  serviceUser: { role: 'consumer', status: 'active' },
} as unknown as Awaited<ReturnType<typeof requireActiveUser>>;

const VALID_BODY = {
  businessNumber: '123-45-67890',
  companyName: '테스트 회사',
  representativeName: '홍길동',
  businessAddress: '서울시 강남구 테스트로 1',
  businessType: '음식업',
  businessCategory: '한식',
  documents: [
    {
      type: 'business_license',
      storagePath: 'user-id/upload-id/business_license/file.pdf',
      originalFileName: 'business_license.pdf',
      contentType: 'application/pdf',
      size: 1024,
    },
    {
      type: 'food_service_permit',
      storagePath: 'user-id/upload-id/food_service_permit/file.pdf',
      originalFileName: 'food_service_permit.pdf',
      contentType: 'application/pdf',
      size: 1024,
    },
    {
      type: 'bank_account',
      storagePath: 'user-id/upload-id/bank_account/file.pdf',
      originalFileName: 'bank_account.pdf',
      contentType: 'application/pdf',
      size: 1024,
    },
  ],
};

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/seller-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/seller-applications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockSellerApplication을 201로 반환하고 auth를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makePostRequest(VALID_BODY));
    const body = (await res.json()) as { data: SellerApplicationResponse };

    expect(res.status).toBe(201);
    expect(body.data.id).toBe(mockSellerApplication.id);
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('잘못된 body는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makePostRequest({}));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 requireActiveUser → checkApplicationEligibility → createSellerApplication 순서로 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(checkApplicationEligibility).mockResolvedValue({
      eligible: true,
    });
    vi.mocked(createSellerApplication).mockResolvedValue(mockSellerApplication);

    const res = await POST(makePostRequest(VALID_BODY));

    expect(res.status).toBe(201);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(checkApplicationEligibility).toHaveBeenCalledWith(
      USER_ID,
      activeUserResult.serviceUser.role
    );
    expect(createSellerApplication).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ businessNumber: VALID_BODY.businessNumber })
    );
  });

  it('requireActiveUser가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );

    const res = await POST(makePostRequest(VALID_BODY));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('eligibility가 seller_already_registered이면 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(checkApplicationEligibility).mockResolvedValue({
      eligible: false,
      reason: 'seller_already_registered',
    });

    const res = await POST(makePostRequest(VALID_BODY));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('SELLER_ALREADY_REGISTERED');
    expect(createSellerApplication).not.toHaveBeenCalled();
  });

  it('eligibility가 application_already_submitted이면 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(checkApplicationEligibility).mockResolvedValue({
      eligible: false,
      reason: 'application_already_submitted',
    });

    const res = await POST(makePostRequest(VALID_BODY));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('APPLICATION_ALREADY_SUBMITTED');
    expect(createSellerApplication).not.toHaveBeenCalled();
  });
});
