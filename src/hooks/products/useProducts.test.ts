import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { productApi } from '@/api/products/productApi';

import { useProducts } from './useProducts';

vi.mock('@/api/products/productApi');

const mockProduct: Product = {
  id: '00000000-0000-4000-8000-000000000051',
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
  endAt: new Date('2099-12-31T23:59:59.000Z'),
  pickupStartTime: '10:00:00',
  pickupEndTime: '13:30:00',
  status: 'active',
  isSoldOut: false,
  isExpired: false,
  displayStatus: 'available',
  updatedAt: new Date('2026-05-07T09:00:00.000Z'),
};

const mockResult: PaginatedResult<Product> = {
  items: [mockProduct],
  page: 1,
  pageSize: 20,
  totalCount: 1,
  totalPages: 1,
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return Wrapper;
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.mocked(productApi.getProducts).mockReset();
  });

  it('productApi.getProducts를 호출하고 결과를 반환한다', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockResult);

    const { result } = renderHook(
      () => useProducts({ page: 1, pageSize: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productApi.getProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
    expect(result.current.data?.items[0].id).toBe(mockProduct.id);
    expect(result.current.data?.totalCount).toBe(1);
  });

  it('updatedAt이 Date 인스턴스로 반환된다', async () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockResult);

    const { result } = renderHook(
      () => useProducts({ page: 1, pageSize: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items[0].updatedAt).toBeInstanceOf(Date);
  });

  it('initialData가 있으면 mount 직후 refetch하지 않고 초기 데이터를 사용한다', async () => {
    const { result } = renderHook(
      () =>
        useProducts(
          { page: 1, pageSize: 20 },
          {
            initialData: mockResult,
          }
        ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items[0].id).toBe(mockProduct.id);
    expect(productApi.getProducts).not.toHaveBeenCalled();
  });

  it('enabled가 false이면 상품 목록을 요청하지 않는다', () => {
    const { result } = renderHook(
      () => useProducts({ page: 1, pageSize: 20 }, { enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(productApi.getProducts).not.toHaveBeenCalled();
  });

  it('queryKey가 queryKeys.products.list(params)와 일치한다', () => {
    vi.mocked(productApi.getProducts).mockResolvedValue(mockResult);

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);

    const params = { page: 1, pageSize: 20 };
    renderHook(() => useProducts(params), { wrapper: Wrapper });

    const queries = client.getQueryCache().getAll();
    expect(queries[0].queryKey).toEqual(queryKeys.products.list(params));
  });
});
