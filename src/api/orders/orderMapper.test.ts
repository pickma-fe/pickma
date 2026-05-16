import { describe, expect, it } from 'vitest';

import type {
  OrderDetailResponse,
  OrderListItemResponse,
} from '@/contracts/order';
import type { PaymentResponse } from '@/contracts/payment';

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
  it('ISO string 날짜 필드를 Date 객체로 변환한다', () => {
    const result = mapOrderListItem(baseListDto);
    expect(result.pickupAt).toBeInstanceOf(Date);
    expect(result.pickupServiceDate).toBeInstanceOf(Date);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

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
  it('ISO string 날짜 필드를 Date 객체로 변환한다', () => {
    const result = mapOrder(baseDetailDto);
    expect(result.pickupAt).toBeInstanceOf(Date);
    expect(result.pickupServiceDate).toBeInstanceOf(Date);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('선택적 날짜 필드: ISO string → Date, 없으면 undefined', () => {
    const withDates = mapOrder({
      ...baseDetailDto,
      expiresAt: '2026-05-12T09:00:00.000Z',
      pickedUpAt: '2026-05-12T10:30:00.000Z',
      cancelledAt: '2026-05-12T11:00:00.000Z',
    });
    expect(withDates.expiresAt).toBeInstanceOf(Date);
    expect(withDates.pickedUpAt).toBeInstanceOf(Date);
    expect(withDates.cancelledAt).toBeInstanceOf(Date);

    const withoutDates = mapOrder(baseDetailDto);
    expect(withoutDates.expiresAt).toBeUndefined();
    expect(withoutDates.pickedUpAt).toBeUndefined();
    expect(withoutDates.cancelledAt).toBeUndefined();
  });

  it('상세 DTO의 status = "no_show" → status: "noShow"', () => {
    const result = mapOrder({ ...baseDetailDto, status: 'no_show' });
    expect(result.status).toBe('noShow');
  });

  it('payment 없음 → payment undefined', () => {
    const result = mapOrder(baseDetailDto);
    expect(result.payment).toBeUndefined();
  });

  it('payment 있음 → ISO date를 Date 객체로 변환', () => {
    const paymentDto: PaymentResponse = {
      id: 'payment-1',
      orderId: 'order-uuid-1',
      orderNumber: 'PM20260101A1B2C3D4E5',
      provider: 'toss',
      providerPaymentKey: 'ppk_test',
      method: 'card',
      amount: 8000,
      status: 'paid',
      paidAt: '2026-05-12T10:00:00.000Z',
      createdAt: '2026-05-12T09:00:00.000Z',
      updatedAt: '2026-05-12T10:00:00.000Z',
    };
    const result = mapOrder({ ...baseDetailDto, payment: paymentDto });
    expect(result.payment).toBeDefined();
    expect(result.payment?.paidAt).toBeInstanceOf(Date);
    expect(result.payment?.createdAt).toBeInstanceOf(Date);
    expect(result.payment?.provider).toBe('toss');
    expect(result.payment?.amount).toBe(8000);
  });
});
