import { describe, expect, it } from 'vitest';

import type { ProductListItemResponse } from '@/contracts/product';

import { mapProduct } from './productMapper';

describe('productMapper', () => {
  const baseProduct: ProductListItemResponse = {
    id: 'product_1',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    menuItemId: 'menu_1',
    name: '마감 할인 크루아상 세트',
    originalPrice: 12000,
    discountPrice: 7200,
    discountRate: 40,
    stock: 8,
    reservedStock: 2,
    availableStock: 6,
    isSoldOut: false,
    isExpired: false,
    displayStatus: 'available',
    endAt: '2026-04-29T13:30:00.000Z',
    pickupStartTime: '10:00:00',
    pickupEndTime: '13:30:00',
    status: 'active',
    updatedAt: '2026-04-29T10:00:00.000Z',
  };

  it('날짜 문자열을 Date로 변환하고 시각 문자열은 그대로 유지한다', () => {
    const product = mapProduct(baseProduct);

    expect(product.endAt).toBeInstanceOf(Date);
    expect(product.updatedAt).toBeInstanceOf(Date);
    expect(product.updatedAt?.toISOString()).toBe('2026-04-29T10:00:00.000Z');
    expect(product.pickupStartTime).toBe('10:00:00');
    expect(product.pickupEndTime).toBe('13:30:00');
  });

  it('상태 플래그 기준으로 displayStatus를 계산한다', () => {
    expect(mapProduct({ ...baseProduct, status: 'closed' }).displayStatus).toBe(
      'closed'
    );
    expect(mapProduct({ ...baseProduct, isExpired: true }).displayStatus).toBe(
      'expired'
    );
    expect(mapProduct({ ...baseProduct, isSoldOut: true }).displayStatus).toBe(
      'soldOut'
    );
  });

  it('displayStatus 우선순위 충돌 케이스를 올바르게 처리한다 (closed > expired > soldOut > available)', () => {
    expect(
      mapProduct({
        ...baseProduct,
        status: 'closed',
        isExpired: true,
        isSoldOut: true,
      }).displayStatus
    ).toBe('closed');

    expect(
      mapProduct({ ...baseProduct, isExpired: true, isSoldOut: true })
        .displayStatus
    ).toBe('expired');

    expect(
      mapProduct({ ...baseProduct, isSoldOut: true, isExpired: false })
        .displayStatus
    ).toBe('soldOut');
  });

  it('가격과 재고 파생 필드를 보존한다', () => {
    const product = mapProduct(baseProduct);

    expect(product.discountRate).toBe(40);
    expect(product.availableStock).toBe(6);
  });
});
