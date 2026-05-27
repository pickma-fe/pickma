import { describe, expect, it, vi } from 'vitest';

import { serverApiClient } from '../serverApiClient';
import { productServerApi } from './productServerApi';

vi.mock('../serverApiClient', () => ({
  serverApiClient: {
    get: vi.fn().mockResolvedValue({
      id: 'product/with?reserved#chars',
      storeId: '00000000-0000-4000-8000-000000000031',
      storeName: '픽마 베이커리',
      menuItemId: '00000000-0000-4000-8000-000000000041',
      name: '마감 할인 크루아상 세트',
      originalPrice: 12000,
      discountPrice: 7200,
      discountRate: 40,
      stock: 8,
      reservedStock: 2,
      availableStock: 6,
      isSoldOut: false,
      isExpired: false,
      displayStatus: 'available',
      endAt: '2099-12-31T23:59:59.000Z',
      pickupStartTime: '10:00:00',
      pickupEndTime: '13:30:00',
      status: 'active',
      updatedAt: '2026-05-07T09:00:00.000Z',
      store: {
        id: '00000000-0000-4000-8000-000000000031',
        name: '픽마 베이커리',
        phone: '02-1234-5678',
        address: '서울시 마포구 월드컵북로 12',
        region: '서울 마포구',
      },
    }),
  },
}));

describe('productServerApi', () => {
  it('상품 ID를 경로 세그먼트로 넣기 전에 인코딩한다', async () => {
    await productServerApi.getProduct('product/with?reserved#chars');

    expect(serverApiClient.get).toHaveBeenCalledWith(
      '/api/products/product%2Fwith%3Freserved%23chars'
    );
  });
});
