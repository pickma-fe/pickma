import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getSellerDashboardStats } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const STORE_ID = 'store-1';

function buildClient(options: {
  totalRows?: { payment_amount: number }[];
  dailyRows?: { created_at: string; payment_amount: number }[];
  recentRows?: {
    id: string;
    order_number: string;
    payment_amount: number;
    status: string;
    created_at: string;
    order_items: { product_name: string }[];
  }[];
  errorOn?: 'total' | 'daily' | 'recent';
}): ReturnType<typeof createServiceRoleClient> {
  const now = new Date().toISOString();

  const totalRows = options.totalRows ?? [{ payment_amount: 12000 }];
  const dailyRows = options.dailyRows ?? [
    { created_at: now, payment_amount: 12000 },
  ];
  const recentRows = options.recentRows ?? [
    {
      id: 'order-1',
      order_number: 'ORD-001',
      payment_amount: 12000,
      status: 'reserved',
      created_at: now,
      order_items: [{ product_name: '테스트 상품' }],
    },
  ];

  // Promise.all 순서: [getTotalStats, getDailyMetrics, getRecentOrders]
  // getTotalStats: from → select → eq → in → resolve
  // getDailyMetrics: from → select → eq → in → gte → lt → resolve
  // getRecentOrders: from → select → eq → order → limit → resolve

  let callIndex = 0;

  const client = {
    from: vi.fn().mockImplementation(() => {
      const currentIndex = callIndex++;
      const isError =
        (options.errorOn === 'total' && currentIndex === 0) ||
        (options.errorOn === 'daily' && currentIndex === 1) ||
        (options.errorOn === 'recent' && currentIndex === 2);

      const makeError = () => ({ data: null, error: { message: 'db error' } });

      if (currentIndex === 0) {
        // getTotalStats: select → eq → in
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi
                .fn()
                .mockResolvedValue(
                  isError ? makeError() : { data: totalRows, error: null }
                ),
            }),
          }),
        };
      }

      if (currentIndex === 1) {
        // getDailyMetrics: select → eq → in → gte → lt
        const chain = {
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lt: vi
            .fn()
            .mockResolvedValue(
              isError ? makeError() : { data: dailyRows, error: null }
            ),
        };
        return {
          select: vi.fn().mockReturnValue(chain),
        };
      }

      // getRecentOrders: select → eq → order → limit
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue(
                  isError ? makeError() : { data: recentRows, error: null }
                ),
            }),
          }),
        }),
      };
    }),
  } as unknown as ReturnType<typeof createServiceRoleClient>;

  return client;
}

describe('getSellerDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('storeId 기준으로 매출 통계를 반환한다', async () => {
    const client = buildClient({});
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getSellerDashboardStats(STORE_ID);

    expect(result.totalSalesAmount).toBe(12000);
    expect(result.totalOrderCount).toBe(1);
    expect(result.dailyMetrics).toHaveLength(7);
    expect(result.recentOrders).toEqual([
      expect.objectContaining({
        id: 'order-1',
        orderNumber: 'ORD-001',
        productName: '테스트 상품',
        paymentAmount: 12000,
      }),
    ]);
  });

  it('order_items가 없으면 productName을 기본값으로 설정한다', async () => {
    const client = buildClient({
      recentRows: [
        {
          id: 'order-2',
          order_number: 'ORD-002',
          payment_amount: 5000,
          status: 'completed',
          created_at: new Date().toISOString(),
          order_items: [],
        },
      ],
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getSellerDashboardStats(STORE_ID);

    expect(result.recentOrders[0].productName).toBe('주문 상품');
  });

  it('totalStats DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const client = buildClient({ errorOn: 'total' });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await expect(getSellerDashboardStats(STORE_ID)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('dailyMetrics DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const client = buildClient({ errorOn: 'daily' });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await expect(getSellerDashboardStats(STORE_ID)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('recentOrders DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const client = buildClient({ errorOn: 'recent' });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await expect(getSellerDashboardStats(STORE_ID)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});
