import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paymentApi } from './paymentApi';
import { apiClient } from '../apiClient';

vi.mock('../apiClient', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('paymentApi.cancelPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('올바른 URL로 POST 호출', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(undefined);

    await paymentApi.cancelPayment('payment-uuid-1', { reason: '단순 변심' });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/payments/payment-uuid-1/cancel',
      { reason: '단순 변심' }
    );
  });

  it('응답값이 있어도 undefined 반환', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ some: 'data' });

    const result = await paymentApi.cancelPayment('payment-uuid-1', {
      reason: '관리자 취소',
    });

    expect(result).toBeUndefined();
  });
});

describe('paymentApi.confirmPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirmPayment는 결제 확인 입력을 contract body로 전달한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(undefined);

    await paymentApi.confirmPayment({
      paymentKey: 'payment-key-1',
      orderNumber: 'PM20260611A1B2C3',
      amount: 7200,
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/payments/confirm', {
      paymentKey: 'payment-key-1',
      orderNumber: 'PM20260611A1B2C3',
      amount: 7200,
    });
  });
});
