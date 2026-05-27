import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminPendingSellerApplicationListResponse } from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockAdminPendingSellerApplicationList } from '@/mocks/admin';

import { GET } from './route';
import { getPendingSellerApplications } from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  getPendingSellerApplications: vi.fn(),
}));

const adminResult = {
  authUser: {},
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

function makeGetRequest(search = ''): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/sellers/pending${search ? `?${search}` : ''}`
  );
}

describe('GET /api/admin/sellers/pending', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockAdminPendingSellerApplicationList를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as {
      data: AdminPendingSellerApplicationListResponse;
    };

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(
      mockAdminPendingSellerApplicationList.items.length
    );
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it('real 모드에서 requireAdmin 호출 후 page/pageSize로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(getPendingSellerApplications).mockResolvedValue(
      mockAdminPendingSellerApplicationList
    );

    const res = await GET(makeGetRequest());

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getPendingSellerApplications).toHaveBeenCalledWith(1, 20);
  });

  it('real 모드에서 잘못된 query는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('page=-1'));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('requireAdmin이 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
