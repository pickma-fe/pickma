import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminOrderListResponse } from '@/contracts/admin';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { filterMockAdminOrders } from '@/mocks/admin';

import { getAdminOrders } from './_lib/service';
import { GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getAdminOrders: vi.fn(),
}));

const adminResult = {
  authUser: {},
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

function makeGetRequest(search = ''): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/orders${search ? `?${search}` : ''}`
  );
}

describe('GET /api/admin/orders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서도 관리자 권한 검증 후 mock 목록을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET(makeGetRequest('status=processing'));
    const body = (await res.json()) as {
      statusCode: number;
      data: AdminOrderListResponse;
    };

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminOrders).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(
      body.data.items.every((order) => order.status === 'processing')
    ).toBe(true);
  });

  it('real 모드에서 requireAdmin 호출 후 query로 service를 호출한다', async () => {
    const serviceResponse = filterMockAdminOrders();
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(getAdminOrders).mockResolvedValue(serviceResponse);

    const res = await GET(
      makeGetRequest('page=2&pageSize=10&sort=pickupAt&order=asc')
    );

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminOrders).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      sort: 'pickupAt',
      order: 'asc',
    });
  });
});
