import { describe, expect, it } from 'vitest';

import { buildOrderName, mapCreateOrderResponse } from './mapper';

describe('buildOrderName', () => {
  it('아이템 1개 → {name} {qty}개', () => {
    const result = buildOrderName([{ product_name: '크루아상', quantity: 2 }]);
    expect(result).toBe('크루아상 2개');
  });

  it('아이템 복수 → {name} {qty}개 외 N건', () => {
    const result = buildOrderName([
      { product_name: '크루아상', quantity: 2 },
      { product_name: '바게트', quantity: 1 },
      { product_name: '머핀', quantity: 3 },
    ]);
    expect(result).toBe('크루아상 2개 외 2건');
  });

  it('빈 배열 → 주문', () => {
    expect(buildOrderName([])).toBe('주문');
  });
});

describe('mapCreateOrderResponse', () => {
  it('모든 필드가 그대로 매핑된다', () => {
    const params = {
      orderId: 'order-1',
      orderNumber: 'PM20260101A1B2C3D4E5',
      orderName: '크루아상 2개',
      paymentAmount: 7200,
      expiresAt: '2026-05-11T10:10:00.000Z',
    };
    expect(mapCreateOrderResponse(params)).toEqual({
      id: 'order-1',
      orderNumber: 'PM20260101A1B2C3D4E5',
      orderName: '크루아상 2개',
      paymentAmount: 7200,
      expiresAt: '2026-05-11T10:10:00.000Z',
    });
  });
});
