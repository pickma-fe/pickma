import { describe, expect, it } from 'vitest';

import { mapOrderDetailRow, mapOrderListRow } from './mapper';

describe('seller mapper re-exports', () => {
  it('mapOrderListRow는 함수다', () => {
    expect(typeof mapOrderListRow).toBe('function');
  });

  it('mapOrderDetailRow는 함수다', () => {
    expect(typeof mapOrderDetailRow).toBe('function');
  });

  it('mapOrderListRow — accepted status passthrough', () => {
    const row = {
      id: 'order-1',
      order_number: 'PM20260101AAAA',
      store_id: 'store-1',
      total_amount: 10000,
      discount_amount: 2000,
      payment_amount: 8000,
      status: 'accepted' as const,
      pickup_at: '2026-05-19T10:00:00.000Z',
      pickup_service_date: '2026-05-19',
      store_order_number: null,
      pickup_number: null,
      expires_at: null,
      created_at: '2026-05-19T08:00:00.000Z',
      updated_at: '2026-05-19T08:00:00.000Z',
      stores: { name: '테스트 스토어' },
    };
    const result = mapOrderListRow(row);
    expect(result.status).toBe('accepted');
  });
});
