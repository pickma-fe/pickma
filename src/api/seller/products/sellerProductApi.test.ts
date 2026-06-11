import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product } from '@/types/product';
import type { ProductListItemResponse } from '@/contracts/product';

import { sellerProductApi } from './sellerProductApi';
import { mapSellerProduct } from './sellerProductMapper';
import { apiClient } from '../../apiClient';

vi.mock('../../apiClient', async (importOriginal) => {
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

vi.mock('./sellerProductMapper', () => ({
  mapSellerProduct: vi.fn(),
}));

const dto = {
  id: 'product-1',
} as ProductListItemResponse;

const product = {
  id: 'product-1',
} as Product;

describe('sellerProductApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapSellerProduct).mockReturnValue(product);
  });

  it('getProducts는 seller products endpoint를 호출하고 mapper 결과를 반환한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([dto]);

    const result = await sellerProductApi.getProducts();

    expect(apiClient.get).toHaveBeenCalledWith('/api/seller/products');
    expect(vi.mocked(mapSellerProduct).mock.calls[0][0]).toBe(dto);
    expect(result).toEqual([product]);
  });

  it('createProduct는 request body를 전달하고 mapper 결과를 반환한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(dto);
    const input = {
      menuItemId: 'menu-item-1',
      discountPrice: 7200,
      stock: 8,
      endAt: new Date('2099-12-31T23:59:59.000Z'),
      pickupStartTime: '10:00:00',
      pickupEndTime: '13:30:00',
    };

    const result = await sellerProductApi.createProduct(input);

    expect(apiClient.post).toHaveBeenCalledWith('/api/seller/products', {
      ...input,
      endAt: '2099-12-31T23:59:59.000Z',
    });
    expect(result).toBe(product);
  });

  it('updateProduct는 product id 경로와 request body를 전달한다', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue(dto);
    const input = {
      stock: 5,
      endAt: new Date('2099-12-31T23:59:59.000Z'),
    };

    const result = await sellerProductApi.updateProduct('product-1', input);

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/seller/products/product-1',
      { stock: 5, endAt: '2099-12-31T23:59:59.000Z' }
    );
    expect(result).toBe(product);
  });

  it('deleteProduct는 null envelope 응답을 void로 변환한다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(null);

    const result = await sellerProductApi.deleteProduct('product-1');

    expect(apiClient.delete).toHaveBeenCalledWith(
      '/api/seller/products/product-1'
    );
    expect(result).toBeUndefined();
  });
});
