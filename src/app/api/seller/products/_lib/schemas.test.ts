import { describe, expect, it } from 'vitest';

import {
  createSellerProductSchema,
  sellerProductIdSchema,
  updateSellerProductSchema,
} from './schemas';

const validCreateBody = {
  menuItemId: '00000000-0000-4000-8000-000000000041',
  discountPrice: 7200,
  stock: 8,
  endAt: '2099-12-31T23:59:59.000Z',
  pickupStartTime: '10:00',
  pickupEndTime: '13:30:00',
};

describe('createSellerProductSchema', () => {
  it('HH:mm pickup time을 HH:mm:ss로 정규화한다', () => {
    const result = createSellerProductSchema.safeParse(validCreateBody);

    expect(result.success).toBe(true);
    expect(result.data?.pickupStartTime).toBe('10:00:00');
    expect(result.data?.pickupEndTime).toBe('13:30:00');
  });

  it('endAt이 ISO datetime이 아니면 validation error를 반환한다', () => {
    const result = createSellerProductSchema.safeParse({
      ...validCreateBody,
      endAt: '2099-12-31',
    });

    expect(result.success).toBe(false);
  });

  it('pickup time이 HH:mm 또는 HH:mm:ss가 아니면 validation error를 반환한다', () => {
    expect(
      createSellerProductSchema.safeParse({
        ...validCreateBody,
        pickupStartTime: '10:00:00.000',
      }).success
    ).toBe(false);
    expect(
      createSellerProductSchema.safeParse({
        ...validCreateBody,
        pickupStartTime: '24:00',
      }).success
    ).toBe(false);
  });

  it('필수값이 없으면 validation error를 반환한다', () => {
    const result = createSellerProductSchema.safeParse({
      discountPrice: 7200,
      stock: 8,
      endAt: '2099-12-31T23:59:59.000Z',
      pickupStartTime: '10:00',
      pickupEndTime: '13:30',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateSellerProductSchema', () => {
  it('최소 1개 수정 필드가 있으면 허용한다', () => {
    const result = updateSellerProductSchema.safeParse({
      pickupStartTime: '09:30',
    });

    expect(result.success).toBe(true);
    expect(result.data?.pickupStartTime).toBe('09:30:00');
  });

  it('빈 body를 validation error로 반환한다', () => {
    const result = updateSellerProductSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('알 수 없는 필드를 거부한다', () => {
    const result = updateSellerProductSchema.safeParse({ name: '새 상품명' });

    expect(result.success).toBe(false);
  });
});

describe('sellerProductIdSchema', () => {
  it('UUID만 허용한다', () => {
    expect(
      sellerProductIdSchema.safeParse('00000000-0000-4000-8000-000000000051')
        .success
    ).toBe(true);
    expect(sellerProductIdSchema.safeParse('not-a-uuid').success).toBe(false);
  });
});
