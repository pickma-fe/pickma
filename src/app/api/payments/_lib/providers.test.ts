import { describe, expect, it } from 'vitest';

import { mockProvider } from './mock-provider';
import { getPaymentProviderAdapter } from './providers';

describe('getPaymentProviderAdapter', () => {
  it('실 provider 연동 전에는 provider 관계없이 임시 mockProvider를 반환한다', () => {
    expect(getPaymentProviderAdapter('toss')).toBe(mockProvider);
    expect(getPaymentProviderAdapter('kakao_pay')).toBe(mockProvider);
    expect(getPaymentProviderAdapter('naver_pay')).toBe(mockProvider);
  });
});
