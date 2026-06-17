import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerDashboardStatsResponse } from '@/contracts/seller';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerDashboardStats } from '@/mocks/seller';

import { getSellerDashboardStats } from './_lib/service';
import { GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getSellerDashboardStats: vi.fn(),
}));

const mockStoreResult = {
  authUser: {},
  serviceUser: {},
  store: { id: 'store-1' },
} as Awaited<ReturnType<typeof requireSellerStore>>;

const mockSupabaseClient = {} as Awaited<ReturnType<typeof createServerClient>>;

const mockStats: SellerDashboardStatsResponse = {
  totalSalesAmount: 100000,
  totalOrderCount: 10,
  dailyMetrics: [],
  recentOrders: [],
};

describe('GET /api/seller/dashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 requireSellerStore 호출 없이 mock 통계를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      data: SellerDashboardStatsResponse;
    };

    expect(res.status).toBe(200);
    expect(requireSellerStore).not.toHaveBeenCalled();
    expect(getSellerDashboardStats).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(200);
    expect(body.data).toEqual(mockSellerDashboardStats);
  });

  it('real 모드에서 supabase client와 storeId를 service에 전달하고 결과를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(mockStoreResult);
    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient);
    vi.mocked(getSellerDashboardStats).mockResolvedValue(mockStats);

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      data: SellerDashboardStatsResponse;
    };

    expect(res.status).toBe(200);
    expect(requireSellerStore).toHaveBeenCalledOnce();
    expect(createServerClient).toHaveBeenCalledOnce();
    expect(getSellerDashboardStats).toHaveBeenCalledWith(
      mockSupabaseClient,
      'store-1'
    );
    expect(body.statusCode).toBe(200);
    expect(body.data.totalSalesAmount).toBe(100000);
  });

  it('권한 검사 실패 시 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(403);
    expect(getSellerDashboardStats).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('store가 없으면 STORE_NOT_FOUND error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.STORE_NOT_FOUND, 404)
    );

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(404);
    expect(body.statusCode).toBe(404);
    expect(body.error.code).toBe('STORE_NOT_FOUND');
  });
});
