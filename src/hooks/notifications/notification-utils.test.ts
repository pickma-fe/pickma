import { describe, expect, it } from 'vitest';

import {
  isNewSellerOrder,
  resolveConsumerOrderToast,
} from './notification-utils';

describe('resolveConsumerOrderToast', () => {
  it('reserved→accepted 전이 시 주문 접수 toast 반환', () => {
    const result = resolveConsumerOrderToast('reserved', 'accepted', '/home');
    expect(result).toEqual({
      message: '주문이 접수되었습니다',
      type: 'success',
    });
  });

  it('accepted→ready 전이 시 준비 완료 toast 반환', () => {
    const result = resolveConsumerOrderToast('accepted', 'ready', '/home');
    expect(result).toEqual({
      message: '준비가 완료되었습니다',
      type: 'success',
    });
  });

  it('ready→completed 전이 시 픽업 완료 toast 반환', () => {
    const result = resolveConsumerOrderToast('ready', 'completed', '/home');
    expect(result).toEqual({ message: '픽업이 완료되었습니다', type: 'info' });
  });

  it('알림 대상이 아닌 전이 시 null 반환', () => {
    expect(
      resolveConsumerOrderToast('pending', 'reserved', '/home')
    ).toBeNull();
    expect(
      resolveConsumerOrderToast('reserved', 'cancelled', '/home')
    ).toBeNull();
  });

  it('/mypage/orders 경로에서는 null 반환', () => {
    expect(
      resolveConsumerOrderToast('reserved', 'accepted', '/mypage/orders')
    ).toBeNull();
  });

  it('/mypage/orders/ 하위 경로에서도 null 반환', () => {
    expect(
      resolveConsumerOrderToast(
        'reserved',
        'accepted',
        '/mypage/orders/abc-123'
      )
    ).toBeNull();
  });

  it('oldStatus가 null이면 null 반환', () => {
    expect(resolveConsumerOrderToast(null, 'accepted', '/home')).toBeNull();
  });

  it('newStatus가 null이면 null 반환', () => {
    expect(resolveConsumerOrderToast('reserved', null, '/home')).toBeNull();
  });
});

describe('isNewSellerOrder', () => {
  it('pending→reserved 전이면 true', () => {
    expect(isNewSellerOrder('pending', 'reserved')).toBe(true);
  });

  it('reserved→reserved는 false (중복 이벤트)', () => {
    expect(isNewSellerOrder('reserved', 'reserved')).toBe(false);
  });

  it('reserved→accepted는 false', () => {
    expect(isNewSellerOrder('reserved', 'accepted')).toBe(false);
  });

  it('newStatus가 null이면 false', () => {
    expect(isNewSellerOrder('pending', null)).toBe(false);
  });

  it('oldStatus가 null이고 newStatus가 reserved면 true', () => {
    expect(isNewSellerOrder(null, 'reserved')).toBe(true);
  });
});
