import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

import { useAcceptSellerOrder } from './useAcceptSellerOrder';
import { useCompleteSellerOrder } from './useCompleteSellerOrder';
import { useMarkSellerOrderReady } from './useMarkSellerOrderReady';
import { useSellerOrder } from './useSellerOrder';
import { useSellerOrders } from './useSellerOrders';

vi.mock('@/api/seller/orders/sellerOrderApi', () => ({
  sellerOrderApi: {
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    acceptOrder: vi.fn(),
    markOrderReady: vi.fn(),
    completeOrder: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

const ORDER_ID = 'order-1';

describe('useSellerOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('params 없이 호출 시 queryKey에 빈 객체를 포함한다', () => {
    vi.mocked(sellerOrderApi.getOrders).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    });

    const { queryClient, wrapper } = createWrapper();
    renderHook(() => useSellerOrders(), { wrapper });

    const queries = queryClient.getQueryCache().getAll();
    expect(queries[0].queryKey).toEqual(['seller', 'orders', 'list', {}]);
  });

  it('params를 queryKey와 queryFn에 반영한다', async () => {
    vi.mocked(sellerOrderApi.getOrders).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    });

    const params = { status: 'reserved' as const };
    const { queryClient, wrapper } = createWrapper();
    renderHook(() => useSellerOrders(params), { wrapper });

    const queries = queryClient.getQueryCache().getAll();
    expect(queries[0].queryKey).toEqual([
      'seller',
      'orders',
      'list',
      { status: 'reserved' },
    ]);
    await waitFor(() =>
      expect(sellerOrderApi.getOrders).toHaveBeenCalledWith(params)
    );
  });
});

describe('useSellerOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('id가 빈 문자열이면 queryFn을 실행하지 않는다', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSellerOrder(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(sellerOrderApi.getOrder).not.toHaveBeenCalled();
  });

  it('id가 있으면 queryKey에 id를 포함하고 getOrder를 호출한다', async () => {
    vi.mocked(sellerOrderApi.getOrder).mockResolvedValue({} as never);

    const { queryClient, wrapper } = createWrapper();
    renderHook(() => useSellerOrder(ORDER_ID), { wrapper });

    const queries = queryClient.getQueryCache().getAll();
    expect(queries[0].queryKey).toEqual([
      'seller',
      'orders',
      'detail',
      ORDER_ID,
    ]);
    await waitFor(() =>
      expect(sellerOrderApi.getOrder).toHaveBeenCalledWith(ORDER_ID)
    );
  });
});

describe('useAcceptSellerOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 seller orders prefix queryKey를 invalidate한다', async () => {
    vi.mocked(sellerOrderApi.acceptOrder).mockResolvedValue(undefined);

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAcceptSellerOrder(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(ORDER_ID);
    });

    expect(sellerOrderApi.acceptOrder).toHaveBeenCalledWith(ORDER_ID);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['seller', 'orders'],
    });
  });
});

describe('useMarkSellerOrderReady', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 seller orders prefix queryKey를 invalidate한다', async () => {
    vi.mocked(sellerOrderApi.markOrderReady).mockResolvedValue(undefined);

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useMarkSellerOrderReady(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(ORDER_ID);
    });

    expect(sellerOrderApi.markOrderReady).toHaveBeenCalledWith(ORDER_ID);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['seller', 'orders'],
    });
  });
});

describe('useCompleteSellerOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 seller orders prefix queryKey를 invalidate한다', async () => {
    vi.mocked(sellerOrderApi.completeOrder).mockResolvedValue(undefined);

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCompleteSellerOrder(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(ORDER_ID);
    });

    expect(sellerOrderApi.completeOrder).toHaveBeenCalledWith(ORDER_ID);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['seller', 'orders'],
    });
  });
});
