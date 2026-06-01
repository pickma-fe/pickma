import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductDetail } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { productApi } from '@/api/products/productApi';

import { useProduct } from './useProduct';

vi.mock('@/api/products/productApi');

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

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return Wrapper;
}

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('productApi.getProduct를 호출하고 상세 데이터를 반환한다', async () => {
    vi.mocked(productApi.getProduct).mockResolvedValue(mockDetail);

    const { result } = renderHook(
      () => useProduct('00000000-0000-4000-8000-000000000051'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productApi.getProduct).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000051'
    );
    expect(result.current.data?.id).toBe(mockDetail.id);
    expect(result.current.data?.store.id).toBe(mockDetail.store.id);
    expect(result.current.data?.description).toBe(mockDetail.description);
  });

  it('updatedAt이 Date 인스턴스로 반환된다', async () => {
    vi.mocked(productApi.getProduct).mockResolvedValue(mockDetail);

    const { result } = renderHook(
      () => useProduct('00000000-0000-4000-8000-000000000051'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.updatedAt).toBeInstanceOf(Date);
  });

  it('초기 상세 데이터가 있으면 로딩 없이 즉시 반환한다', () => {
    const { result } = renderHook(
      () =>
        useProduct('00000000-0000-4000-8000-000000000051', {
          initialData: mockDetail,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.data?.id).toBe(mockDetail.id);
    expect(result.current.isLoading).toBe(false);
  });

  it('초기 상세 데이터 ID가 요청 ID와 다르면 초기 주입을 사용하지 않는다', () => {
    const { result } = renderHook(
      () =>
        useProduct('00000000-0000-4000-8000-000000000052', {
          initialData: mockDetail,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.data).toBeUndefined();
  });

  it('id가 빈 문자열이면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHook(() => useProduct(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(productApi.getProduct).not.toHaveBeenCalled();
  });

  it('queryKey가 queryKeys.products.detail(id)와 일치한다', async () => {
    vi.mocked(productApi.getProduct).mockResolvedValue(mockDetail);

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);

    const id = '00000000-0000-4000-8000-000000000051';
    renderHook(() => useProduct(id), { wrapper: Wrapper });

    const queries = client.getQueryCache().getAll();
    expect(queries[0].queryKey).toEqual(queryKeys.products.detail(id));
    expect(queries[0].queryKey).toEqual(['products', 'detail', id]);
  });
});
