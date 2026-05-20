import { describe, expect, it } from 'vitest';

import { orderIdSchema, sellerOrderListQuerySchema } from './schemas';

describe('sellerOrderListQuerySchema', () => {
  it('기본값으로 파싱된다', () => {
    const result = sellerOrderListQuerySchema.parse({});
    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      sort: 'createdAt',
      order: 'desc',
    });
  });

  it('accepted 상태를 허용한다', () => {
    const result = sellerOrderListQuerySchema.parse({ status: 'accepted' });
    expect(result.status).toBe('accepted');
  });

  it('reserved / ready / completed / cancelled / no_show / expired 허용', () => {
    const statuses = [
      'reserved',
      'ready',
      'completed',
      'cancelled',
      'no_show',
      'expired',
    ] as const;
    for (const status of statuses) {
      expect(sellerOrderListQuerySchema.parse({ status }).status).toBe(status);
    }
  });

  it('payment_pending 상태는 허용하지 않는다', () => {
    expect(() =>
      sellerOrderListQuerySchema.parse({ status: 'payment_pending' })
    ).toThrow();
  });

  it('processing 상태는 허용하지 않는다', () => {
    expect(() =>
      sellerOrderListQuerySchema.parse({ status: 'processing' })
    ).toThrow();
  });

  it('page, pageSize 문자열을 숫자로 coerce한다', () => {
    const result = sellerOrderListQuerySchema.parse({
      page: '2',
      pageSize: '50',
    });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it('알 수 없는 필드는 strict 모드로 거부한다', () => {
    expect(() =>
      sellerOrderListQuerySchema.parse({ unknown: 'field' })
    ).toThrow();
  });
});

describe('orderIdSchema', () => {
  it('유효한 UUID를 통과시킨다', () => {
    expect(() =>
      orderIdSchema.parse('00000000-0000-4000-8000-000000000001')
    ).not.toThrow();
  });

  it('UUID가 아닌 문자열을 거부한다', () => {
    expect(() => orderIdSchema.parse('not-a-uuid')).toThrow();
  });
});
