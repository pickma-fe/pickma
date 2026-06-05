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
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as {
      statusCode: number;
      data: AdminPendingSellerApplicationListResponse;
    };

    expect(res.status).toBe(200);
    expect(body.statusCode).toBe(res.status);
    expect(body.data.items).toHaveLength(
      mockAdminPendingSellerApplicationList.items.length
    );
    expect(requireAdmin).toHaveBeenCalledOnce();
  });

  it('mock 모드에서도 권한 검사가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(403);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getPendingSellerApplications).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('real 모드에서 requireAdmin 호출 후 query로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(getPendingSellerApplications).mockResolvedValue(
      mockAdminPendingSellerApplicationList
    );

    const res = await GET(
      makeGetRequest(
        'page=2&pageSize=10&keyword=%ED%99%8D%EA%B8%B8%EB%8F%99&createdDate=2026-06-04&businessCategory=%EB%B2%A0%EC%9D%B4%EC%BB%A4%EB%A6%AC'
      )
    );

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getPendingSellerApplications).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      keyword: '홍길동',
      createdDate: '2026-06-04',
      businessCategory: '베이커리',
    });
  });

  it('real 모드에서 잘못된 query여도 requireAdmin을 먼저 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('page=-1'));
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(400);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getPendingSellerApplications).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('존재하지 않는 createdDate는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('createdDate=2026-02-31'));
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(400);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getPendingSellerApplications).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 권한 검사가 실패하면 query validation보다 403을 먼저 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET(makeGetRequest('page=-1'));
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(403);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getPendingSellerApplications).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('requireAdmin이 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(403);
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
