import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminStoreListResponse } from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockAdminStoreList } from '@/mocks/admin';

import { getAdminStores } from './_lib/service';
import { GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getAdminStores: vi.fn(),
}));

const adminResult = {
  authUser: {},
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

function makeGetRequest(search = ''): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/stores${search ? `?${search}` : ''}`
  );
}

describe('GET /api/admin/stores', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서도 관리자 권한 검증 후 mock 목록을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('status=active'));
    const body = (await res.json()) as {
      statusCode: number;
      data: AdminStoreListResponse;
    };

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminStores).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.data.items.every((store) => store.status === 'active')).toBe(
      true
    );
  });

  it('real 모드에서 requireAdmin 호출 후 query로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(getAdminStores).mockResolvedValue(mockAdminStoreList);

    const res = await GET(
      makeGetRequest(
        'page=2&pageSize=10&keyword=%ED%94%BD%EB%A7%88&status=inactive&region=%EC%84%9C%EC%9A%B8'
      )
    );

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminStores).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      keyword: '픽마',
      status: 'inactive',
      region: '서울',
    });
  });

  it('잘못된 query여도 requireAdmin을 먼저 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('page=-1'));
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(400);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminStores).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('권한 검사가 실패하면 error envelope를 반환한다', async () => {
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
    expect(getAdminStores).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
