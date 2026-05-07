import { describe, expect, it } from 'vitest';

import type { ProductListItemResponse } from '@/contracts/product';

import { ALL_CATEGORY_ID, useConsumerProducts } from './useConsumerProducts';

const NOW = new Date('2026-05-06T09:00:00.000Z').getTime();

function createProduct(
  overrides: Partial<ProductListItemResponse> & { id: string }
): ProductListItemResponse {
  const { id, ...productOverrides } = overrides;

  return {
    id,
    storeId: 'store_1',
    storeName: '테스트 매장',
    categoryId: 'category_bakery',
    categoryName: '베이커리',
    menuItemId: `menu_${id}`,
    name: `상품 ${id}`,
    originalPrice: 10000,
    discountPrice: 7000,
    discountRate: 30,
    stock: 10,
    reservedStock: 0,
    availableStock: 10,
    isSoldOut: false,
    isExpired: false,
    displayStatus: 'available',
    endAt: '2026-05-06T12:00:00.000Z',
    pickupStartTime: '2026-05-06T10:00:00.000Z',
    pickupEndTime: '2026-05-06T12:00:00.000Z',
    status: 'active',
    updatedAt: '2026-05-06T08:00:00.000Z',
    ...productOverrides,
  };
}

describe('useConsumerProducts', () => {
  it('가용 상품만 지역, 카테고리, 할인율 조건으로 필터링한다', () => {
    const products = [
      createProduct({
        id: 'product_1',
        storeId: 'store_1',
        categoryId: 'category_bakery',
        discountRate: 45,
      }),
      createProduct({
        id: 'product_2',
        storeId: 'store_2',
        categoryId: 'category_bakery',
        discountRate: 45,
      }),
      createProduct({
        id: 'product_3',
        storeId: 'store_1',
        categoryId: 'category_salad',
        discountRate: 45,
      }),
      createProduct({
        id: 'product_4',
        storeId: 'store_1',
        categoryId: 'category_bakery',
        discountRate: 15,
      }),
      createProduct({
        id: 'product_5',
        storeId: 'store_1',
        categoryId: 'category_bakery',
        discountRate: 45,
        endAt: '2026-05-06T08:59:00.000Z',
      }),
    ];

    const result = useConsumerProducts({
      products,
      selectedCategoryId: 'category_bakery',
      selectedSortOption: 'deadline',
      selectedDiscountOption: 'over-40',
      currentPage: 1,
      productsPerPage: 10,
      now: NOW,
      selectedRegion: '서울 마포구',
      productRegions: {
        store_1: '서울 마포구',
        store_2: '서울 강남구',
      },
    });

    expect(result.sortedProducts.map((product) => product.id)).toEqual([
      'product_1',
    ]);
    expect(result.paginatedProducts.map((product) => product.id)).toEqual([
      'product_1',
    ]);
  });

  it('정렬 옵션과 페이지 값을 안전하게 보정한다', () => {
    const products = [
      createProduct({
        id: 'product_1',
        discountPrice: 5000,
      }),
      createProduct({
        id: 'product_2',
        discountPrice: 3000,
      }),
      createProduct({
        id: 'product_3',
        discountPrice: 7000,
      }),
    ];

    const result = useConsumerProducts({
      products,
      selectedCategoryId: ALL_CATEGORY_ID,
      selectedSortOption: 'price-low',
      selectedDiscountOption: 'all',
      currentPage: 10,
      productsPerPage: 2,
      now: NOW,
    });

    expect(result.sortedProducts.map((product) => product.id)).toEqual([
      'product_2',
      'product_1',
      'product_3',
    ]);
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.paginatedProducts.map((product) => product.id)).toEqual([
      'product_3',
    ]);
  });

  it('알 수 없는 옵션과 0 이하 pageSize를 기본값으로 보정한다', () => {
    const products = [
      createProduct({
        id: 'product_1',
        endAt: '2026-05-06T12:00:00.000Z',
      }),
      createProduct({
        id: 'product_2',
        endAt: '2026-05-06T10:00:00.000Z',
      }),
    ];

    const result = useConsumerProducts({
      products,
      selectedCategoryId: ALL_CATEGORY_ID,
      selectedSortOption: 'unknown',
      selectedDiscountOption: 'unknown',
      currentPage: 0,
      productsPerPage: 0,
      now: NOW,
    });

    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(2);
    expect(result.sortedProducts.map((product) => product.id)).toEqual([
      'product_2',
      'product_1',
    ]);
    expect(result.paginatedProducts.map((product) => product.id)).toEqual([
      'product_2',
    ]);
  });
});
