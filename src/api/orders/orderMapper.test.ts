import { describe, expect, it } from 'vitest';

import type {
  OrderDetailResponse,
  OrderListItemResponse,
} from '@/contracts/order';

import { mapOrder, mapOrderListItem } from './orderMapper';

const baseListDto: OrderListItemResponse = {
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
  createdAt: '2026-05-12T08:00:00.000Z',
  updatedAt: '2026-05-12T08:00:00.000Z',
};

const baseDetailDto: OrderDetailResponse = {
  ...baseListDto,
  items: [],
};

describe('mapOrderListItem', () => {
  it('status = "payment_pending" → status: "paymentPending"', () => {
    const result = mapOrderListItem({
      ...baseListDto,
      status: 'payment_pending',
    });
    expect(result.status).toBe('paymentPending');
  });

  it('status = "no_show" → status: "noShow"', () => {
    const result = mapOrderListItem({ ...baseListDto, status: 'no_show' });
    expect(result.status).toBe('noShow');
  });
});

describe('mapOrder', () => {
  it('상세 DTO의 status = "no_show" → status: "noShow"', () => {
    const result = mapOrder({ ...baseDetailDto, status: 'no_show' });
    expect(result.status).toBe('noShow');
  });
});
