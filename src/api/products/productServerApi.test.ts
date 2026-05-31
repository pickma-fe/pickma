import { beforeEach, describe, expect, it, vi } from 'vitest';

import { serverApiClient } from '../serverApiClient';
import { productServerApi } from './productServerApi';

vi.mock('../serverApiClient', () => ({
  serverApiClient: {
    get: vi.fn(),
  },
}));

const mockProductResponse = {
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
};

describe('productServerApi', () => {
  beforeEach(() => {
    vi.mocked(serverApiClient.get).mockReset();
  });

  it('상품 목록 endpoint를 서버 API client로 호출하고 mapper 결과를 반환한다', async () => {
    vi.mocked(serverApiClient.get).mockResolvedValue({
      items: [mockProductResponse],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    });

    const result = await productServerApi.getProducts({
      page: 1,
      pageSize: 10,
      region: '서울 마포구',
      availableOnly: true,
      sort: 'endAt',
      order: 'asc',
    });

    expect(serverApiClient.get).toHaveBeenCalledWith('/api/products', {
      page: 1,
      pageSize: 10,
      region: '서울 마포구',
      availableOnly: true,
      sort: 'endAt',
      order: 'asc',
    });
    expect(result.items[0].updatedAt).toBeInstanceOf(Date);
    expect(result.items[0].id).toBe(mockProductResponse.id);
  });

  it('상품 ID를 경로 세그먼트로 넣기 전에 인코딩한다', async () => {
    vi.mocked(serverApiClient.get).mockResolvedValue({
      ...mockProductResponse,
      store: {
        id: '00000000-0000-4000-8000-000000000031',
        name: '픽마 베이커리',
        phone: '02-1234-5678',
        address: '서울시 마포구 월드컵북로 12',
        region: '서울 마포구',
      },
    });

    await productServerApi.getProduct('product/with?reserved#chars');

    expect(serverApiClient.get).toHaveBeenCalledWith(
      '/api/products/product%2Fwith%3Freserved%23chars'
    );
  });
});
