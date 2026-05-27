import { notFound } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import type { ProductDetail } from '@/types/product';
import { ApiError } from '@/api/apiClient';
import { productServerApi } from '@/api/products/productServerApi';

import ProductDetailPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/api/products/productServerApi', () => ({
  productServerApi: {
    getProduct: vi.fn(),
  },
}));

vi.mock('@/components/consumer/ProductDetailContainer', () => ({
  ProductDetailContainer: vi.fn(() => null),
}));

const mockDetail: ProductDetail = {
  id: '00000000-0000-4000-8000-000000000051',
  storeId: '00000000-0000-4000-8000-000000000031',
  storeName: '픽마 베이커리',
  menuItemId: '00000000-0000-4000-8000-000000000041',
  name: '마감 할인 크루아상 세트',
  description: '당일 생산 후 남은 크루아상과 페이스트리를 담은 세트입니다.',
  originalPrice: 12000,
  discountPrice: 7200,
  discountRate: 40,
  stock: 8,
  reservedStock: 2,
  availableStock: 6,
  endAt: new Date('2099-12-31T23:59:59.000Z'),
  pickupStartTime: '10:00:00',
  pickupEndTime: '13:30:00',
  status: 'active',
  isSoldOut: false,
  isExpired: false,
  displayStatus: 'available',
  updatedAt: new Date('2026-05-07T09:00:00.000Z'),
  store: {
    id: '00000000-0000-4000-8000-000000000031',
    name: '픽마 베이커리',
    phone: '02-1234-5678',
    address: '서울시 마포구 월드컵북로 12',
    addressDetail: '1층',
    region: '서울 마포구',
  },
};

describe('ProductDetailPage', () => {
  it('서버에서 상품 상세를 조회해 초기 데이터로 전달한다', async () => {
    vi.mocked(productServerApi.getProduct).mockResolvedValue(mockDetail);

    const element = await ProductDetailPage({
      params: Promise.resolve({
        productId: '00000000-0000-4000-8000-000000000051',
      }),
    });

    expect(productServerApi.getProduct).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000051'
    );
    expect(element.props).toMatchObject({
      productId: '00000000-0000-4000-8000-000000000051',
      initialProduct: mockDetail,
    });
  });

  it('상품이 없으면 notFound를 호출한다', async () => {
    vi.mocked(productServerApi.getProduct).mockRejectedValue(
      new ApiError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.')
    );

    await expect(
      ProductDetailPage({
        params: Promise.resolve({
          productId: '00000000-0000-4000-8000-000000000051',
        }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
