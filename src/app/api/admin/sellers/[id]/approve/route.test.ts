import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { POST } from './route';
import { approveSellerApplication } from '../../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../../_lib/service', () => ({
  approveSellerApplication: vi.fn(),
}));

const SELLER_ID = '00000000-0000-4000-8000-000000000001';

const adminResult = {
  authUser: {},
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

function makeRequest(): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/sellers/${SELLER_ID}/approve`,
    { method: 'POST' }
  );
}

function makeParams(id = SELLER_ID) {
  return { params: Promise.resolve({ id }) };
}

describe('POST /api/admin/sellers/[id]/approve', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 null을 반환하고 requireAdmin을 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makeRequest(), makeParams());
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it('real 모드에서 requireAdmin 호출 후 approveSellerApplication을 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(approveSellerApplication).mockResolvedValue(undefined);

    const res = await POST(makeRequest(), makeParams());

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(approveSellerApplication).toHaveBeenCalledWith(SELLER_ID);
  });

  it('requireAdmin이 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await POST(makeRequest(), makeParams());
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
