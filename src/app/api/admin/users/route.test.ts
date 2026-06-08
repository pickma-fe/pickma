import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminUserListResponse } from '@/contracts/admin';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { filterMockAdminUsers } from '@/mocks/admin';

import { getAdminUsers } from './_lib/service';
import { GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getAdminUsers: vi.fn(),
}));

const adminResult = {
  authUser: {},
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

function makeGetRequest(search = ''): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/users${search ? `?${search}` : ''}`
  );
}

describe('GET /api/admin/users', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서도 관리자 권한 검증 후 mock 목록을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('role=admin'));
    const body = (await res.json()) as {
      statusCode: number;
      data: AdminUserListResponse;
    };

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminUsers).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.data.items.every((user) => user.role === 'admin')).toBe(true);
  });

  it('real 모드에서 requireAdmin 호출 후 query로 service를 호출한다', async () => {
    const serviceResponse = filterMockAdminUsers();
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(getAdminUsers).mockResolvedValue(serviceResponse);

    const res = await GET(
      makeGetRequest('page=2&pageSize=10&keyword=admin&status=active')
    );

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminUsers).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      keyword: 'admin',
      status: 'active',
    });
  });
});
