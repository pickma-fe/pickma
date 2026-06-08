import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';

import { getAdminOrders } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const MOCK_ORDER = {
  id: 'order-00000000-0000-4000-8000-000000000001',
  order_number: 'ORDER-20260601-0001',
  store_id: 'store-00000000-0000-4000-8000-000000000001',
  total_amount: 12000,
  discount_amount: 5000,
  payment_amount: 7000,
  status: 'reserved' as const,
  pickup_at: '2026-06-01T10:00:00.000Z',
  pickup_service_date: '2026-06-01',
  store_order_number: '20260601-0000001',
  pickup_number: '101',
  expires_at: null,
  created_at: '2026-06-01T01:00:00.000Z',
  updated_at: '2026-06-01T01:00:00.000Z',
  stores: {
    name: '픽마 베이커리',
  },
};

interface OrderQuerySpies {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
}

interface StoreLookupSpies {
  select: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
}

function buildOrdersClient({
  storeIds = [],
  orders = [MOCK_ORDER],
  count = orders.length,
}: {
  storeIds?: string[];
  orders?: (typeof MOCK_ORDER)[];
  count?: number;
} = {}): {
  client: ReturnType<typeof createServiceRoleClient>;
  orderQuery: OrderQuerySpies;
  storeQuery: StoreLookupSpies;
} {
  const orderQuery: OrderQuerySpies = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };
  orderQuery.eq.mockReturnValue(orderQuery);
  orderQuery.or.mockReturnValue(orderQuery);
  orderQuery.order.mockReturnValue(orderQuery);
  orderQuery.range.mockResolvedValue({
    data: orders,
    count,
    error: null,
  });

  const storeQuery: StoreLookupSpies = {
    select: vi.fn(),
    ilike: vi.fn(),
  };
  storeQuery.select.mockReturnValue(storeQuery);
  storeQuery.ilike.mockResolvedValue({
    data: storeIds.map((id) => ({ id })),
    error: null,
  });

  const client = {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return {
          select: orderQuery.select.mockReturnValue(orderQuery),
        };
      }

      if (table === 'stores') {
        return storeQuery;
      }

      throw new Error(`unexpected table: ${table}`);
    }),
  } as unknown as ReturnType<typeof createServiceRoleClient>;

  return { client, orderQuery, storeQuery };
}

describe('getAdminOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keyword 검색에 주문번호와 매장명 매칭 store id를 함께 적용한다', async () => {
    const { client, orderQuery, storeQuery } = buildOrdersClient({
      storeIds: ['store-id-1', 'store-id-2'],
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getAdminOrders({
      page: 1,
      pageSize: 20,
      keyword: '픽마',
    });

    expect(storeQuery.ilike).toHaveBeenCalledWith('name', '%픽마%');
    expect(orderQuery.or).toHaveBeenCalledWith(
      [
        'order_number.ilike.%픽마%',
        'store_order_number.ilike.%픽마%',
        'pickup_number.ilike.%픽마%',
        'store_id.eq.store-id-1',
        'store_id.eq.store-id-2',
      ].join(',')
    );
  });

  it('LIKE wildcard는 escape하고 PostgREST OR 문법 문자는 검색어에서 제거한다', async () => {
    const { client, orderQuery, storeQuery } = buildOrdersClient({
      storeIds: ['store-id-1'],
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getAdminOrders({
      page: 1,
      pageSize: 20,
      keyword: '50%_주문*',
    });

    expect(storeQuery.ilike).toHaveBeenCalledWith('name', '%50\\%\\_주문%');
    expect(orderQuery.or).toHaveBeenCalledWith(
      [
        'order_number.ilike.%50\\%\\_주문%',
        'store_order_number.ilike.%50\\%\\_주문%',
        'pickup_number.ilike.%50\\%\\_주문%',
        'store_id.eq.store-id-1',
      ].join(',')
    );
  });
});
