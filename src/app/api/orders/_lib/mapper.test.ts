import { describe, expect, it } from 'vitest';

import type { PaymentRow } from '@/app/api/payments/_lib/mapper';

import {
  buildOrderName,
  mapCreateOrderResponse,
  mapOrderDetailRow,
  mapOrderItemRow,
  mapOrderListRow,
} from './mapper';
import type { OrderDetailRow, OrderItemRow, OrderListRow } from './mapper';

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

const baseListRow: OrderListRow = {
  id: 'order-uuid-1',
  order_number: 'PM20260101A1B2C3D4E5',
  store_id: 'store-uuid-1',
  total_amount: 10000,
  discount_amount: 2000,
  payment_amount: 8000,
  status: 'reserved',
  pickup_at: '2026-05-12T10:00:00.000Z',
  pickup_service_date: '2026-05-12',
  store_order_number: 'S-001',
  pickup_number: 'P-001',
  expires_at: '2026-05-12T09:10:00.000Z',
  created_at: '2026-05-12T08:00:00.000Z',
  updated_at: '2026-05-12T08:00:00.000Z',
  stores: { name: '크루아상 베이커리' },
};

const baseItemRow: OrderItemRow = {
  id: 'item-uuid-1',
  order_id: 'order-uuid-1',
  product_id: 'product-uuid-1',
  product_name: '크루아상',
  original_price: 5000,
  discount_price: 3500,
  quantity: 2,
  subtotal: 7000,
  created_at: '2026-05-12T08:00:00.000Z',
};

describe('mapOrderListRow', () => {
  it('모든 필수 필드를 정상 매핑한다', () => {
    const result = mapOrderListRow(baseListRow);
    expect(result).toEqual({
      id: 'order-uuid-1',
      orderNumber: 'PM20260101A1B2C3D4E5',
      storeId: 'store-uuid-1',
      storeName: '크루아상 베이커리',
      totalAmount: 10000,
      discountAmount: 2000,
      paymentAmount: 8000,
      status: 'reserved',
      pickupAt: '2026-05-12T10:00:00.000Z',
      pickupServiceDate: '2026-05-12',
      storeOrderNumber: 'S-001',
      pickupNumber: 'P-001',
      expiresAt: '2026-05-12T09:10:00.000Z',
      createdAt: '2026-05-12T08:00:00.000Z',
      updatedAt: '2026-05-12T08:00:00.000Z',
    });
  });

  it('store_order_number null → storeOrderNumber undefined', () => {
    const result = mapOrderListRow({
      ...baseListRow,
      store_order_number: null,
    });
    expect(result.storeOrderNumber).toBeUndefined();
  });

  it('pickup_number null → pickupNumber undefined', () => {
    const result = mapOrderListRow({ ...baseListRow, pickup_number: null });
    expect(result.pickupNumber).toBeUndefined();
  });

  it('expires_at null → expiresAt undefined', () => {
    const result = mapOrderListRow({ ...baseListRow, expires_at: null });
    expect(result.expiresAt).toBeUndefined();
  });

  it('status = "no_show" → status: "no_show" (contract DTO 그대로)', () => {
    const result = mapOrderListRow({ ...baseListRow, status: 'no_show' });
    expect(result.status).toBe('no_show');
  });

  it('status = "payment_pending" → status: "payment_pending"', () => {
    const result = mapOrderListRow({
      ...baseListRow,
      status: 'payment_pending',
    });
    expect(result.status).toBe('payment_pending');
  });
});

describe('mapOrderItemRow', () => {
  it('모든 필드를 정상 매핑한다', () => {
    const result = mapOrderItemRow(baseItemRow);
    expect(result).toEqual({
      id: 'item-uuid-1',
      orderId: 'order-uuid-1',
      productId: 'product-uuid-1',
      productName: '크루아상',
      originalPrice: 5000,
      discountPrice: 3500,
      quantity: 2,
      subtotal: 7000,
      createdAt: '2026-05-12T08:00:00.000Z',
    });
  });
});

describe('mapOrderDetailRow', () => {
  it('cancelled_at null → cancelledAt undefined, items 배열 포함', () => {
    const row: OrderDetailRow = {
      ...baseListRow,
      cancel_reason: null,
      cancelled_at: null,
      picked_up_at: null,
      order_items: [baseItemRow],
      payments: null,
    };
    const result = mapOrderDetailRow(row);
    expect(result.cancelledAt).toBeUndefined();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productName).toBe('크루아상');
  });

  it('picked_up_at, cancel_reason 값 있을 때 그대로 매핑', () => {
    const row: OrderDetailRow = {
      ...baseListRow,
      cancel_reason: '단순 변심',
      cancelled_at: '2026-05-12T09:00:00.000Z',
      picked_up_at: '2026-05-12T10:30:00.000Z',
      order_items: [],
      payments: null,
    };
    const result = mapOrderDetailRow(row);
    expect(result.cancelledAt).toBe('2026-05-12T09:00:00.000Z');
    expect(result.cancelReason).toBe('단순 변심');
    expect(result.pickedUpAt).toBe('2026-05-12T10:30:00.000Z');
    expect(result.items).toHaveLength(0);
  });

  it('payments null → payment undefined', () => {
    const row: OrderDetailRow = {
      ...baseListRow,
      cancel_reason: null,
      cancelled_at: null,
      picked_up_at: null,
      order_items: [],
      payments: null,
    };
    const result = mapOrderDetailRow(row);
    expect(result.payment).toBeUndefined();
  });

  it('payments 있음 → payment 매핑, orderNumber은 order_number 사용', () => {
    const paymentRow: PaymentRow = {
      id: 'payment-1',
      order_id: baseListRow.id,
      provider: 'toss',
      provider_payment_key: 'ppk_test',
      provider_order_id: 'poi_test',
      method: 'card',
      method_detail: null,
      amount: 5000,
      status: 'paid',
      paid_at: '2026-05-12T10:00:00.000Z',
      refunded_at: null,
      refund_reason: null,
      created_at: '2026-05-12T09:00:00.000Z',
      updated_at: '2026-05-12T10:00:00.000Z',
    };
    const row: OrderDetailRow = {
      ...baseListRow,
      cancel_reason: null,
      cancelled_at: null,
      picked_up_at: null,
      order_items: [],
      payments: paymentRow,
    };
    const result = mapOrderDetailRow(row);
    expect(result.payment).toBeDefined();
    expect(result.payment?.orderNumber).toBe(baseListRow.order_number);
    expect(result.payment?.status).toBe('paid');
    expect(result.payment?.amount).toBe(5000);
  });
});
