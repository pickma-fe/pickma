import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';

import type { ProductRow } from './mapper';
import { getProductById, getProducts } from './service';

const baseRow: ProductRow = {
  id: '00000000-0000-4000-8000-000000000051',
  store_id: '00000000-0000-4000-8000-000000000031',
  menu_item_id: '00000000-0000-4000-8000-000000000041',
  category_id: '00000000-0000-4000-8000-000000000011',
  discount_price: 7200,
  stock: 8,
  reserved_stock: 2,
  end_at: '2099-12-31T23:59:59.000Z',
  pickup_start_time: '10:00:00',
  pickup_end_time: '13:30:00',
  status: 'active',
  updated_at: '2026-05-07T09:00:00.000Z',
  menu_items: {
    id: '00000000-0000-4000-8000-000000000041',
    name: '마감 할인 크루아상 세트',
    description: '당일 생산 후 남은 크루아상과 페이스트리를 담은 세트입니다.',
    image: null,
    original_price: 12000,
  },
  categories: { id: '00000000-0000-4000-8000-000000000011', name: '베이커리' },
  stores: {
    id: '00000000-0000-4000-8000-000000000031',
    name: '픽마 베이커리',
    description: null,
    phone: '02-1234-5678',
    address: '서울시 마포구 월드컵북로 12',
    address_detail: '1층',
    region: '서울 마포구',
    image: null,
  },
};

function buildChain(result: {
  data?: unknown;
  error?: { code: string; message: string } | null;
  count?: number | null;
}) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    gt: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
    then: vi.fn(
      (
        onFulfilled?: (value: typeof result) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(result).then(onFulfilled, onRejected)
    ),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.gt.mockReturnValue(chain);
  chain.ilike.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

function buildSupabase(result: {
  data?: unknown;
  error?: { code: string; message: string } | null;
  count?: number | null;
}) {
  const chain = buildChain(result);
  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  } as unknown as SupabaseClient<Database> & {
    _chain: ReturnType<typeof buildChain>;
  };
}

describe('getProducts', () => {
  it('상품 목록과 페이지 정보를 반환한다', async () => {
    const supabase = buildSupabase({ data: [baseRow], error: null, count: 1 });

    const result = await getProducts(supabase, { page: 1, pageSize: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(baseRow.id);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('products.status = active 필터를 적용한다', async () => {
    const supabase = buildSupabase({ data: [], error: null, count: 0 });

    await getProducts(supabase, { page: 1, pageSize: 20 });

    expect(supabase._chain.eq).toHaveBeenCalledWith('status', 'active');
  });

  it('stores.status = approved 필터를 적용한다', async () => {
    const supabase = buildSupabase({ data: [], error: null, count: 0 });

    await getProducts(supabase, { page: 1, pageSize: 20 });

    expect(supabase._chain.eq).toHaveBeenCalledWith(
      'stores.status',
      'approved'
    );
  });

  it('region 파라미터가 있으면 stores.region 필터를 적용한다', async () => {
    const supabase = buildSupabase({ data: [], error: null, count: 0 });

    await getProducts(supabase, {
      page: 1,
      pageSize: 20,
      region: '서울 마포구',
    });

    expect(supabase._chain.eq).toHaveBeenCalledWith(
      'stores.region',
      '서울 마포구'
    );
  });

  it('region과 availableOnly를 함께 사용해도 DB 조회 결과를 유지한다', async () => {
    const supabase = buildSupabase({ data: [baseRow], error: null, count: 1 });

    const result = await getProducts(supabase, {
      page: 1,
      pageSize: 20,
      region: '서울 마포구',
      availableOnly: true,
    });

    expect(supabase._chain.eq).toHaveBeenCalledWith(
      'stores.region',
      '서울 마포구'
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(baseRow.id);
  });

  it('availableOnly만으로는 전체 조회 경로로 전환하지 않고 range를 유지한다', async () => {
    const supabase = buildSupabase({ data: [baseRow], error: null, count: 1 });

    await getProducts(supabase, {
      page: 1,
      pageSize: 20,
      availableOnly: true,
    });

    expect(supabase._chain.gt).toHaveBeenCalledWith(
      'end_at',
      expect.any(String)
    );
    expect(supabase._chain.range).toHaveBeenCalledWith(0, 19);
  });

  it('가격 낮은순 정렬은 DB range 페이지네이션을 유지한다', async () => {
    const supabase = buildSupabase({ data: [baseRow], error: null, count: 1 });

    await getProducts(supabase, {
      page: 1,
      pageSize: 20,
      sort: 'discountPrice',
      order: 'asc',
    });

    expect(supabase._chain.order).toHaveBeenCalledWith('discount_price', {
      ascending: true,
    });
    expect(supabase._chain.range).toHaveBeenCalledWith(0, 19);
  });

  it('할인율 필터는 서버 후처리 페이지네이션 경로를 사용한다', async () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({
      ...baseRow,
      id: `00000000-0000-4000-8000-00000000005${index}`,
      end_at: `2099-12-31T23:5${index}:59.000Z`,
    }));
    const supabase = buildSupabase({ data: rows, error: null, count: 8 });

    const result = await getProducts(supabase, {
      page: 2,
      pageSize: 5,
      discountOption: 'over-40',
    });

    expect(supabase._chain.range).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(3);
    expect(result.items[0].id).toBe('00000000-0000-4000-8000-000000000055');
  });

  it('할인율 높은순 정렬은 서버 후처리 페이지네이션 경로를 사용한다', async () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({
      ...baseRow,
      id: `00000000-0000-4000-8000-00000000005${index}`,
      discount_price: 7200 - index,
    }));
    const supabase = buildSupabase({ data: rows, error: null, count: 8 });

    await getProducts(supabase, {
      page: 2,
      pageSize: 5,
      sort: 'discountRate',
      order: 'desc',
    });

    expect(supabase._chain.range).not.toHaveBeenCalled();
  });

  it('keyword 파라미터가 있으면 menu_items.name ILIKE 필터를 적용한다', async () => {
    const supabase = buildSupabase({ data: [], error: null, count: 0 });

    await getProducts(supabase, { page: 1, pageSize: 20, keyword: '크루아상' });

    expect(supabase._chain.ilike).toHaveBeenCalledWith(
      'menu_items.name',
      '%크루아상%'
    );
  });

  it('keyword 파라미터가 없으면 ILIKE 필터를 적용하지 않는다', async () => {
    const supabase = buildSupabase({ data: [], error: null, count: 0 });

    await getProducts(supabase, { page: 1, pageSize: 20 });

    expect(supabase._chain.ilike).not.toHaveBeenCalled();
  });

  it('확장 경로에서 keyword+discountOption 조합 시 인메모리 keyword 필터를 적용한다', async () => {
    const rows = [
      { ...baseRow, id: '00000000-0000-4000-8000-000000000051' },
      {
        ...baseRow,
        id: '00000000-0000-4000-8000-000000000052',
        menu_items: { ...baseRow.menu_items, name: '소금빵 세트' },
      },
      {
        ...baseRow,
        id: '00000000-0000-4000-8000-000000000053',
        menu_items: { ...baseRow.menu_items, name: '크루아상 단품' },
      },
    ];
    const supabase = buildSupabase({
      data: rows,
      error: null,
      count: rows.length,
    });

    const result = await getProducts(supabase, {
      page: 1,
      pageSize: 20,
      keyword: '크루아상',
      discountOption: 'over-40',
    });

    expect(supabase._chain.range).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(2);
    expect(result.items.every((i) => i.name.includes('크루아상'))).toBe(true);
  });

  it('region 파라미터가 없으면 stores.region 필터를 적용하지 않는다', async () => {
    const supabase = buildSupabase({ data: [], error: null, count: 0 });

    await getProducts(supabase, { page: 1, pageSize: 20 });

    const eqCalls = (supabase._chain.eq as ReturnType<typeof vi.fn>).mock.calls;
    expect(
      eqCalls.every((args: unknown[]) => args[0] !== 'stores.region')
    ).toBe(true);
  });

  it('페이지네이션: range를 올바른 인덱스로 호출한다', async () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({
      ...baseRow,
      id: `00000000-0000-4000-8000-00000000005${index}`,
      end_at: `2099-12-31T23:5${index}:59.000Z`,
    }));
    const supabase = buildSupabase({ data: rows, error: null, count: 8 });

    await getProducts(supabase, { page: 2, pageSize: 5 });

    expect(supabase._chain.range).toHaveBeenCalledWith(5, 9);
  });

  it('totalPages를 올바르게 계산한다', async () => {
    const rows = Array.from({ length: 23 }, (_, index) => ({
      ...baseRow,
      id: `product_${index}`,
    }));
    const supabase = buildSupabase({ data: rows, error: null, count: 23 });

    const result = await getProducts(supabase, { page: 1, pageSize: 10 });

    expect(result.totalPages).toBe(3);
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 throw한다', async () => {
    const supabase = buildSupabase({
      data: null,
      error: { code: '42501', message: 'permission denied' },
      count: null,
    });

    await expect(
      getProducts(supabase, { page: 1, pageSize: 20 })
    ).rejects.toThrow(AppError);
    await expect(
      getProducts(supabase, { page: 1, pageSize: 20 })
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});

describe('getProductById', () => {
  it('상품 상세를 반환한다', async () => {
    const supabase = buildSupabase({ data: baseRow, error: null });

    const result = await getProductById(
      supabase,
      '00000000-0000-4000-8000-000000000051'
    );

    expect(result.id).toBe(baseRow.id);
    expect(result.store.id).toBe(baseRow.stores.id);
    expect(result.description).toBe(baseRow.menu_items.description);
  });

  it('products.status = active 필터를 적용한다', async () => {
    const supabase = buildSupabase({ data: baseRow, error: null });

    await getProductById(supabase, '00000000-0000-4000-8000-000000000051');

    expect(supabase._chain.eq).toHaveBeenCalledWith('status', 'active');
  });

  it('stores.status = approved 필터를 적용한다', async () => {
    const supabase = buildSupabase({ data: baseRow, error: null });

    await getProductById(supabase, '00000000-0000-4000-8000-000000000051');

    expect(supabase._chain.eq).toHaveBeenCalledWith(
      'stores.status',
      'approved'
    );
  });

  it('PGRST116 에러 시 PRODUCT_NOT_FOUND를 throw한다', async () => {
    const supabase = buildSupabase({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    await expect(
      getProductById(supabase, '00000000-0000-4000-8000-000000000051')
    ).rejects.toMatchObject({ code: ERROR_CODE.PRODUCT_NOT_FOUND });
  });

  it('data가 null이면 PRODUCT_NOT_FOUND를 throw한다', async () => {
    const supabase = buildSupabase({ data: null, error: null });

    await expect(
      getProductById(supabase, '00000000-0000-4000-8000-000000000051')
    ).rejects.toMatchObject({ code: ERROR_CODE.PRODUCT_NOT_FOUND });
  });

  it('그 외 DB 에러 시 INTERNAL_SERVER_ERROR를 throw한다', async () => {
    const supabase = buildSupabase({
      data: null,
      error: { code: '42501', message: 'permission denied' },
    });

    await expect(
      getProductById(supabase, '00000000-0000-4000-8000-000000000051')
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});
