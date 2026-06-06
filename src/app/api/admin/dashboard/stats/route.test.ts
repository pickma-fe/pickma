import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminDashboardStatsResponse } from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockAdminDashboardStats } from '@/mocks/admin';

import { GET } from './route';
import { getAdminDashboardStats } from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  getAdminDashboardStats: vi.fn(),
}));

const adminDashboardStats: AdminDashboardStatsResponse = {
  totalStores: 1,
  totalProducts: 2,
  totalOrders: 3,
  totalUsers: 4,
  dailyMetrics: [],
  recentPendingApplications: [],
  recentOrders: [],
  recentUsers: [],
};

const adminResult = {
  authUser: {},
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

describe('GET /api/admin/dashboard/stats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서도 관리자 권한 검증 후 mock 통계를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      data: AdminDashboardStatsResponse;
    };

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminDashboardStats).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.data).toEqual(mockAdminDashboardStats);
  });

  it('real 모드에서 requireAdmin 호출 후 service 결과를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(getAdminDashboardStats).mockResolvedValue(adminDashboardStats);

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      data: AdminDashboardStatsResponse;
    };

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminDashboardStats).toHaveBeenCalledOnce();
    expect(body.statusCode).toBe(res.status);
    expect(body.data.totalStores).toBe(1);
  });

  it('권한 검사가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await GET();
    const body = (await res.json()) as {
      statusCode: number;
      error: { code: string };
    };

    expect(res.status).toBe(403);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getAdminDashboardStats).not.toHaveBeenCalled();
    expect(body.statusCode).toBe(res.status);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
