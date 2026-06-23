import { describe, expect, it } from 'vitest';

import type { Order } from '@/types/order';

import { mapOrderToMypageReservation } from './mypageReservationMapper';

const baseOrder: Omit<Order, 'items' | 'payment'> = {
  id: 'order-1',
  orderNumber: 'PM202606230001',
  storeId: 'store-1',
  storeName: '픽마 베이커리',
  totalAmount: 12000,
  discountAmount: 4000,
  paymentAmount: 8000,
  status: 'reserved',
  pickupAt: new Date('2026-06-23T09:00:00.000Z'),
  pickupServiceDate: new Date('2026-06-23T00:00:00.000Z'),
  storeOrderNumber: 'A-001',
  pickupNumber: 'P001',
  createdAt: new Date('2026-06-23T08:00:00.000Z'),
  updatedAt: new Date('2026-06-23T08:00:00.000Z'),
};

describe('mapOrderToMypageReservation', () => {
  it('주문 목록 이미지가 있으면 예약 카드 이미지로 사용한다', () => {
    const reservation = mapOrderToMypageReservation({
      ...baseOrder,
      image: '/images/mock/products/product-salad.jpg',
    });

    expect(reservation.imageUrl).toBe(
      '/images/mock/products/product-salad.jpg'
    );
  });

  it('주문 목록 이미지가 없으면 fallback 이미지를 사용한다', () => {
    const reservation = mapOrderToMypageReservation(baseOrder);

    expect(reservation.imageUrl).toBe('/images/fallback/bread.jpg');
  });
});
