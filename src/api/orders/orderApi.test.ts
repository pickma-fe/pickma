import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateOrderResponse } from '@/contracts/order';

import { ApiError, apiClient } from '../apiClient';
import { orderApi } from './orderApi';

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

const mockCreateOrderResponse: CreateOrderResponse = {
  id: 'order-1',
  orderNumber: 'PM20260511A1B2C3D4E5',
  orderName: '크루아상 2개',
  paymentAmount: 7200,
  expiresAt: '2026-05-11T10:10:00.000Z',
};

describe('orderApi.createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 CreateOrderResponse를 CreatedOrderPaymentInfo로 변환한다 (expiresAt은 Date)', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockCreateOrderResponse);

    const result = await orderApi.createOrder({
      productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      quantity: 2,
      pickupAt: new Date('2026-05-11T11:00:00.000Z'),
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/orders', {
      productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      quantity: 2,
      pickupAt: '2026-05-11T11:00:00.000Z',
    });
    expect(result).toEqual({
      id: 'order-1',
      orderNumber: 'PM20260511A1B2C3D4E5',
      orderName: '크루아상 2개',
      paymentAmount: 7200,
      expiresAt: new Date('2026-05-11T10:10:00.000Z'),
    });
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('API 오류 시 ApiError를 rethrow한다', async () => {
    const error = new ApiError(409, 'OUT_OF_STOCK', '재고가 부족합니다.');
    vi.mocked(apiClient.post).mockRejectedValue(error);

    await expect(
      orderApi.createOrder({
        productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        quantity: 1,
        pickupAt: new Date('2026-05-11T11:00:00.000Z'),
      })
    ).rejects.toBe(error);
  });
});
