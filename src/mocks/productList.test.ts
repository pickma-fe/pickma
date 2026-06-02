import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMockProductListResponse } from './productList';

describe('buildMockProductListResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T03:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('region, category, keyword, discountOption, sort 조건을 반영한다', () => {
    const result = buildMockProductListResponse({
      page: 1,
      pageSize: 10,
      region: '서울 강남구',
      categoryId: '00000000-0000-4000-8000-000000000011',
      keyword: '티라미수',
      discountOption: 'over-40',
      sort: 'discountRate',
      order: 'desc',
      availableOnly: true,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('티라미수 컵케이크');
    expect(result.items[0].discountRate).toBeGreaterThanOrEqual(40);
  });

  it('페이지네이션을 적용한다', () => {
    const result = buildMockProductListResponse({
      page: 2,
      pageSize: 3,
      availableOnly: true,
      sort: 'endAt',
      order: 'asc',
    });

    expect(result.items).toHaveLength(3);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(3);
    expect(result.totalPages).toBeGreaterThan(1);
  });

  it('가격대 필터는 단일 조건과 최대 가격 미만 조건을 반영한다', () => {
    const baseProduct = {
      id: 'product-1',
      storeId: 'store-1',
      storeName: '활성 매장',
      menuItemId: 'menu-1',
      name: '가격 테스트 상품',
      originalPrice: 30000,
      discountPrice: 10000,
      discountRate: 20,
      stock: 3,
      reservedStock: 0,
      availableStock: 3,
      isSoldOut: false,
      isExpired: false,
      displayStatus: 'available',
      endAt: new Date('2026-05-29T10:00:00.000Z').toISOString(),
      pickupStartTime: '09:00:00',
      pickupEndTime: '10:00:00',
      status: 'active',
      updatedAt: new Date('2026-05-29T03:00:00.000Z').toISOString(),
    } as const;
    const maxBoundaryProduct = {
      ...baseProduct,
      id: 'product-2',
      discountPrice: 20000,
    } as const;
    const overMaxProduct = {
      ...baseProduct,
      id: 'product-3',
      discountPrice: 20001,
    } as const;

    const result = buildMockProductListResponse(
      {
        page: 1,
        pageSize: 10,
        minPrice: 10000,
        maxPrice: 20000,
      },
      [baseProduct, maxBoundaryProduct, overMaxProduct]
    );

    expect(result.items.map((product) => product.id)).toEqual(['product-1']);
  });

  it('availableOnly=false여도 비활성 상품은 제외한다', () => {
    const activeProduct = {
      id: 'active-product',
      storeId: 'store-1',
      storeName: '활성 매장',
      menuItemId: 'menu-1',
      name: '활성 상품',
      originalPrice: 10000,
      discountPrice: 8000,
      discountRate: 20,
      stock: 3,
      reservedStock: 0,
      availableStock: 3,
      isSoldOut: false,
      isExpired: false,
      displayStatus: 'available',
      endAt: new Date('2026-05-29T10:00:00.000Z').toISOString(),
      pickupStartTime: '09:00:00',
      pickupEndTime: '10:00:00',
      status: 'active',
      updatedAt: new Date('2026-05-29T03:00:00.000Z').toISOString(),
    } as const;
    const closedProduct = {
      ...activeProduct,
      id: 'closed-product',
      name: '비활성 상품',
      status: 'closed',
      displayStatus: 'closed',
    } as const;

    const result = buildMockProductListResponse(
      {
        page: 1,
        pageSize: 10,
        availableOnly: false,
      },
      [activeProduct, closedProduct]
    );

    expect(result.items.map((product) => product.id)).toEqual([
      'active-product',
    ]);
  });
});
