import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getAdminDashboardStats } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

function buildDashboardClient(
  counts: Record<string, number>,
  errorTable?: string
): {
  client: ReturnType<typeof createServiceRoleClient>;
  dailyMetricQuery: {
    in: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
  };
} {
  const now = new Date().toISOString();
  const dailyMetricQuery = {
    in: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
  };
  dailyMetricQuery.in.mockReturnValue(dailyMetricQuery);
  dailyMetricQuery.gte.mockReturnValue(dailyMetricQuery);
  dailyMetricQuery.lt.mockResolvedValue({
    data: [{ created_at: now, payment_amount: 12000 }],
    error: null,
  });

  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      const countResult = {
        data: null,
        error: table === errorTable ? { message: 'db error' } : null,
        count: counts[table] ?? 0,
      };

      return {
        select: vi.fn().mockImplementation((columns: string) => {
          if (columns === 'id') {
            return Promise.resolve(countResult);
          }

          if (table === 'orders' && columns === 'created_at, payment_amount') {
            return dailyMetricQuery;
          }

          if (table === 'orders') {
            return {
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'order-1',
                      payment_amount: 12000,
                      status: 'ready',
                      created_at: now,
                      stores: { name: '테스트 가게' },
                      order_items: [{ product_name: '테스트 상품' }],
                    },
                  ],
                  error: null,
                }),
              }),
            };
          }

          if (table === 'seller_applications') {
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'application-1',
                        company_name: '테스트 상점',
                        business_category: '베이커리',
                        created_at: now,
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'users') {
            return {
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'user-1',
                      name: '테스트 사용자',
                      email: 'user@example.com',
                      created_at: now,
                    },
                  ],
                  error: null,
                }),
              }),
            };
          }

          return Promise.resolve({
            data: [],
            error: null,
          });
        }),
      };
    }),
  } as unknown as ReturnType<typeof createServiceRoleClient>;

  return { client, dailyMetricQuery };
}

describe('getAdminDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('관리자 대시보드 통계와 최근 현황을 반환한다', async () => {
    const { client, dailyMetricQuery } = buildDashboardClient({
      stores: 12,
      menu_items: 34,
      orders: 56,
      users: 78,
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getAdminDashboardStats();

    expect(client.from).toHaveBeenCalledWith('stores');
    expect(client.from).toHaveBeenCalledWith('menu_items');
    expect(client.from).toHaveBeenCalledWith('orders');
    expect(client.from).toHaveBeenCalledWith('users');
    expect(dailyMetricQuery.in).toHaveBeenCalledWith('status', [
      'reserved',
      'accepted',
      'ready',
      'completed',
      'no_show',
    ]);
    expect(result).toMatchObject({
      totalStores: 12,
      totalProducts: 34,
      totalOrders: 56,
      totalUsers: 78,
    });
    expect(result.dailyMetrics).toHaveLength(7);
    expect(result.recentPendingApplications).toEqual([
      expect.objectContaining({
        id: 'application-1',
        companyName: '테스트 상점',
      }),
    ]);
    expect(result.recentOrders).toEqual([
      expect.objectContaining({
        id: 'order-1',
        productName: '테스트 상품',
        storeName: '테스트 가게',
      }),
    ]);
    expect(result.recentUsers).toEqual([
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
      }),
    ]);
  });

  it('count 조회 오류가 있으면 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const { client } = buildDashboardClient({}, 'orders');
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await expect(getAdminDashboardStats()).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});
