import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductListParams } from '@/contracts/product';
import type { Database } from '@/lib/supabase/database';
import { createServiceRoleClient } from '@/lib/supabase/service';

import type { ProductRow } from './mapper';
import { getRankedProducts } from './recommendation';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const productA: ProductRow = {
  id: '00000000-0000-4000-8000-000000000051',
  store_id: '00000000-0000-4000-8000-000000000031',
  menu_item_id: '00000000-0000-4000-8000-000000000041',
  category_id: '00000000-0000-4000-8000-000000000011',
  discount_price: 7200,
  original_price: 12000,
  discount_rate: 40,
  available_stock: 6,
  stock: 8,
  reserved_stock: 2,
  end_at: '2099-12-31T23:59:59.000Z',
  pickup_start_time: '10:00:00',
  pickup_end_time: '13:30:00',
  status: 'active',
  updated_at: '2026-05-07T09:00:00.000Z',
  menu_items: {
    id: '00000000-0000-4000-8000-000000000041',
    name: '크루아상 세트',
    description: null,
    image: null,
  },
  categories: { id: '00000000-0000-4000-8000-000000000011', name: '베이커리' },
  stores: {
    id: '00000000-0000-4000-8000-000000000031',
    name: '픽마 베이커리',
    description: null,
    phone: '02-1234-5678',
    address: '서울시 마포구',
    address_detail: '1층',
    region: '서울 마포구',
    image: null,
    latitude: 37.5665,
    longitude: 126.978,
  },
};

const productB: ProductRow = {
  ...productA,
  id: '00000000-0000-4000-8000-000000000052',
  store_id: '00000000-0000-4000-8000-000000000032',
  category_id: '00000000-0000-4000-8000-000000000012',
  discount_price: 6900,
  discount_rate: 42,
  menu_items: {
    ...productA.menu_items,
    id: '00000000-0000-4000-8000-000000000042',
    name: '샐러드 볼',
  },
  categories: { id: '00000000-0000-4000-8000-000000000012', name: '샐러드' },
  stores: {
    ...productA.stores,
    id: '00000000-0000-4000-8000-000000000032',
    name: '픽마 샐러드',
    latitude: 37.5765,
    longitude: 126.988,
  },
};

function buildCandidateSupabase(rows: ProductRow[], count = rows.length) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    gt: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    then: vi.fn(
      (
        onFulfilled?: (value: {
          data: ProductRow[];
          error: null;
          count: number;
        }) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) =>
        Promise.resolve({ data: rows, error: null, count }).then(
          onFulfilled,
          onRejected
        )
    ),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.gt.mockReturnValue(chain);
  chain.gte.mockReturnValue(chain);
  chain.lt.mockReturnValue(chain);
  chain.ilike.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.range.mockReturnValue(chain);

  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  } as unknown as SupabaseClient<Database>;
}

function buildServiceRoleClientMock(params: {
  popularityRows?: unknown[];
  popularityError?: object | null;
  orderHistoryRows?: unknown[];
  orderHistoryError?: object | null;
  viewHistoryRows?: unknown[];
  viewHistoryError?: object | null;
}) {
  let orderItemsCallCount = 0;

  return {
    from: vi.fn((table: string) => {
      if (table === 'order_items') {
        orderItemsCallCount += 1;

        const rows =
          orderItemsCallCount === 1
            ? (params.popularityRows ?? [])
            : (params.orderHistoryRows ?? []);

        const chain = {
          select: vi.fn(),
          in: vi.fn(),
          gte: vi.fn(),
          eq: vi.fn(),
          then: vi.fn(
            (
              onFulfilled?: (value: {
                data: unknown[];
                error: object | null;
              }) => unknown,
              onRejected?: (reason: unknown) => unknown
            ) =>
              Promise.resolve({
                data: rows,
                error:
                  orderItemsCallCount === 1
                    ? (params.popularityError ?? null)
                    : (params.orderHistoryError ?? null),
              }).then(onFulfilled, onRejected)
          ),
        };
        chain.select.mockReturnValue(chain);
        chain.in.mockReturnValue(chain);
        chain.gte.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);

        return chain;
      }

      if (table === 'product_view_events') {
        const chain = {
          select: vi.fn(),
          eq: vi.fn(),
          gte: vi.fn(),
          order: vi.fn(),
          limit: vi.fn(),
          then: vi.fn(
            (
              onFulfilled?: (value: {
                data: unknown[];
                error: object | null;
              }) => unknown,
              onRejected?: (reason: unknown) => unknown
            ) =>
              Promise.resolve({
                data: params.viewHistoryRows ?? [],
                error: params.viewHistoryError ?? null,
              }).then(onFulfilled, onRejected)
          ),
        };
        chain.select.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);
        chain.gte.mockReturnValue(chain);
        chain.order.mockReturnValue(chain);
        chain.limit.mockReturnValue(chain);

        return chain;
      }

      throw new Error(`unexpected table: ${table}`);
    }),
  };
}

describe('getRankedProducts', () => {
  const baseParams: ProductListParams = {
    page: 1,
    pageSize: 20,
    availableOnly: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('popular 정렬은 최근 주문 수가 높은 상품을 먼저 반환한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildServiceRoleClientMock({
        popularityRows: [
          {
            product_id: productA.id,
            quantity: 1,
            orders: {
              created_at: new Date().toISOString(),
              status: 'reserved',
            },
          },
          {
            product_id: productB.id,
            quantity: 3,
            orders: {
              created_at: new Date().toISOString(),
              status: 'completed',
            },
          },
        ],
      }) as never
    );

    const result = await getRankedProducts(
      buildCandidateSupabase([productA, productB]),
      {
        ...baseParams,
        sort: 'popular',
      }
    );

    expect(result.items.map((item) => item.id)).toEqual([
      productB.id,
      productA.id,
    ]);
  });

  it('aiRecommendation은 로그인 사용자가 없으면 인기순으로 fallback한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildServiceRoleClientMock({
        popularityRows: [
          {
            product_id: productA.id,
            quantity: 1,
            orders: {
              created_at: new Date().toISOString(),
              status: 'reserved',
            },
          },
          {
            product_id: productB.id,
            quantity: 2,
            orders: {
              created_at: new Date().toISOString(),
              status: 'completed',
            },
          },
        ],
      }) as never
    );

    const result = await getRankedProducts(
      buildCandidateSupabase([productA, productB]),
      {
        ...baseParams,
        sort: 'aiRecommendation',
      }
    );

    expect(result.items.map((item) => item.id)).toEqual([
      productB.id,
      productA.id,
    ]);
  });

  it('aiRecommendation은 주문/조회 이력과 거리 신호가 맞는 상품을 우선한다', async () => {
    vi.mocked(createServiceRoleClient).mockImplementation(
      () =>
        buildServiceRoleClientMock({
          popularityRows: [
            {
              product_id: productB.id,
              quantity: 5,
              orders: {
                created_at: new Date().toISOString(),
                status: 'completed',
              },
            },
          ],
          orderHistoryRows: [
            {
              product_id: 'ordered-product-1',
              quantity: 2,
              orders: {
                created_at: new Date().toISOString(),
                status: 'completed',
              },
              products: {
                store_id: productA.store_id,
                category_id: productA.category_id,
              },
            },
          ],
          viewHistoryRows: [
            {
              store_id: productA.store_id,
              category_id: productA.category_id,
              viewed_at: new Date().toISOString(),
            },
          ],
        }) as never
    );

    const result = await getRankedProducts(
      buildCandidateSupabase([productA, productB]),
      {
        ...baseParams,
        sort: 'aiRecommendation',
        userLat: 37.5665,
        userLng: 126.978,
      },
      'user-1'
    );

    expect(result.items[0].id).toBe(productA.id);
  });

  it('aiRecommendation 계산 중 프로필 조회가 실패하면 인기순으로 fallback한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildServiceRoleClientMock({
        popularityRows: [
          {
            product_id: productA.id,
            quantity: 1,
            orders: {
              created_at: new Date().toISOString(),
              status: 'reserved',
            },
          },
          {
            product_id: productB.id,
            quantity: 3,
            orders: {
              created_at: new Date().toISOString(),
              status: 'completed',
            },
          },
        ],
        orderHistoryError: { message: 'boom' },
      }) as never
    );

    const result = await getRankedProducts(
      buildCandidateSupabase([productA, productB]),
      {
        ...baseParams,
        sort: 'aiRecommendation',
      },
      'user-1'
    );

    expect(result.items.map((item) => item.id)).toEqual([
      productB.id,
      productA.id,
    ]);
  });

  it('실제 매칭 count가 rows 길이보다 커도 totalCount와 totalPages는 실제 count를 유지한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildServiceRoleClientMock({
        popularityRows: [],
      }) as never
    );

    const result = await getRankedProducts(
      buildCandidateSupabase([productA, productB], 1000),
      {
        ...baseParams,
        sort: 'popular',
      }
    );

    expect(result.totalCount).toBe(1000);
    expect(result.totalPages).toBe(50);
  });

  it('후보 조회에 stable order를 적용한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildServiceRoleClientMock({
        popularityRows: [],
      }) as never
    );
    const candidateSupabase = buildCandidateSupabase([
      productA,
      productB,
    ]) as never as {
      from: ReturnType<typeof vi.fn>;
      _chain: { order: ReturnType<typeof vi.fn> };
    };

    await getRankedProducts(candidateSupabase as never, {
      ...baseParams,
      sort: 'popular',
    });

    expect(candidateSupabase._chain.order).toHaveBeenNthCalledWith(
      1,
      'end_at',
      {
        ascending: true,
      }
    );
    expect(candidateSupabase._chain.order).toHaveBeenNthCalledWith(
      2,
      'discount_rate',
      { ascending: false }
    );
    expect(candidateSupabase._chain.order).toHaveBeenNthCalledWith(3, 'id', {
      ascending: true,
    });
  });

  it('aiRecommendation은 현재 페이지 기준 후보 window만 조회한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildServiceRoleClientMock({
        popularityRows: [],
      }) as never
    );
    const candidateSupabase = buildCandidateSupabase([
      productA,
      productB,
    ]) as never as {
      from: ReturnType<typeof vi.fn>;
      _chain: { range: ReturnType<typeof vi.fn> };
    };

    await getRankedProducts(
      candidateSupabase as never,
      {
        ...baseParams,
        page: 2,
        pageSize: 20,
        sort: 'aiRecommendation',
      },
      'user-1'
    );

    expect(candidateSupabase._chain.range).toHaveBeenCalledWith(0, 79);
  });
});
