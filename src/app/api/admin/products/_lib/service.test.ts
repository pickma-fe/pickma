import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';

import { getAdminProducts } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const MOCK_PRODUCT = {
  id: 'product-00000000-0000-4000-8000-000000000001',
  store_id: 'store-00000000-0000-4000-8000-000000000001',
  menu_item_id: 'menu-00000000-0000-4000-8000-000000000001',
  category_id: null,
  discount_price: 7000,
  original_price: 12000,
  discount_rate: 42,
  available_stock: 8,
  stock: 10,
  reserved_stock: 2,
  end_at: '2026-06-30T09:00:00.000Z',
  pickup_start_time: '18:00',
  pickup_end_time: '20:00',
  status: 'active' as const,
  updated_at: '2026-06-01T00:00:00.000Z',
  menu_items: {
    id: 'menu-00000000-0000-4000-8000-000000000001',
    name: '마감 식빵 세트',
    image: null,
  },
  categories: null,
  stores: {
    id: 'store-00000000-0000-4000-8000-000000000001',
    name: '픽마 베이커리',
  },
};

interface ProductQuerySpies {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
}

interface LookupQuerySpies {
  select: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
}

function buildLookupQuery(data: { id: string }[]): LookupQuerySpies {
  const query: LookupQuerySpies = {
    select: vi.fn(),
    ilike: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.ilike.mockResolvedValue({ data, error: null });

  return query;
}

function buildProductsClient({
  menuItemIds = [],
  storeIds = [],
  products = [MOCK_PRODUCT],
  count = products.length,
}: {
  menuItemIds?: string[];
  storeIds?: string[];
  products?: (typeof MOCK_PRODUCT)[];
  count?: number;
} = {}): {
  client: ReturnType<typeof createServiceRoleClient>;
  productQuery: ProductQuerySpies;
  menuItemQuery: LookupQuerySpies;
  storeQuery: LookupQuerySpies;
} {
  const productQuery: ProductQuerySpies = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };
  productQuery.eq.mockReturnValue(productQuery);
  productQuery.or.mockReturnValue(productQuery);
  productQuery.order.mockReturnValue(productQuery);
  productQuery.range.mockResolvedValue({
    data: products,
    count,
    error: null,
  });

  const menuItemQuery = buildLookupQuery(menuItemIds.map((id) => ({ id })));
  const storeQuery = buildLookupQuery(storeIds.map((id) => ({ id })));

  const client = {
    from: vi.fn((table: string) => {
      if (table === 'products') {
        return {
          select: productQuery.select.mockReturnValue({
            order: productQuery.order,
          }),
        };
      }

      if (table === 'menu_items') {
        return menuItemQuery;
      }

      if (table === 'stores') {
        return storeQuery;
      }

      throw new Error(`unexpected table: ${table}`);
    }),
  } as unknown as ReturnType<typeof createServiceRoleClient>;

  return { client, productQuery, menuItemQuery, storeQuery };
}

describe('getAdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keyword 매칭 ID가 없으면 products 쿼리를 실행하지 않고 빈 결과를 반환한다', async () => {
    const { client, productQuery } = buildProductsClient({
      menuItemIds: [],
      storeIds: [],
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getAdminProducts({
      page: 1,
      pageSize: 20,
      keyword: '없는상품',
    });

    expect(productQuery.range).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    });
  });

  it('keyword 매칭 ID가 많아도 OR 필터를 구성하고 pagination/count를 유지한다', async () => {
    const menuItemIds = Array.from(
      { length: 3 },
      (_, index) => `menu-id-${index}`
    );
    const storeIds = Array.from(
      { length: 2 },
      (_, index) => `store-id-${index}`
    );
    const { client, productQuery } = buildProductsClient({
      menuItemIds,
      storeIds,
      count: 25,
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getAdminProducts({
      page: 2,
      pageSize: 10,
      keyword: '픽마',
    });

    expect(productQuery.or).toHaveBeenCalledWith(
      [
        'menu_item_id.eq.menu-id-0',
        'menu_item_id.eq.menu-id-1',
        'menu_item_id.eq.menu-id-2',
        'store_id.eq.store-id-0',
        'store_id.eq.store-id-1',
      ].join(',')
    );
    expect(productQuery.range).toHaveBeenCalledWith(10, 19);
    expect(result.totalCount).toBe(25);
    expect(result.totalPages).toBe(3);
  });

  it('status/storeId 필터와 keyword 필터를 함께 적용한다', async () => {
    const { client, productQuery } = buildProductsClient({
      menuItemIds: ['menu-id-1'],
      storeIds: ['store-id-1'],
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getAdminProducts({
      page: 1,
      pageSize: 20,
      keyword: '픽마',
      status: 'closed',
      storeId: 'store-id-filter',
    });

    expect(productQuery.eq).toHaveBeenCalledWith('status', 'closed');
    expect(productQuery.eq).toHaveBeenCalledWith('store_id', 'store-id-filter');
    expect(productQuery.or).toHaveBeenCalledWith(
      'menu_item_id.eq.menu-id-1,store_id.eq.store-id-1'
    );
  });
});
