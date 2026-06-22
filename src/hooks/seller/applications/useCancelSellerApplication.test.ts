import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/queryKeys';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

import { useCancelSellerApplication } from './useCancelSellerApplication';

vi.mock('@/api/seller-applications/sellerApplicationApi', () => ({
  sellerApplicationApi: {
    cancelMyApplication: vi.fn(),
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

describe('useCancelSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancelMyApplication을 호출한다', async () => {
    vi.mocked(sellerApplicationApi.cancelMyApplication).mockResolvedValue(
      undefined
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCancelSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(sellerApplicationApi.cancelMyApplication).toHaveBeenCalledOnce();
  });

  it('성공 시 sellers.onboardingStatus 쿼리를 무효화한다', async () => {
    vi.mocked(sellerApplicationApi.cancelMyApplication).mockResolvedValue(
      undefined
    );

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.sellers.onboardingStatus(),
    });
  });

  it('cancelMyApplication 실패 시 에러를 전파한다', async () => {
    const mockError = new Error('APPLICATION_CANCEL_NOT_ALLOWED');
    vi.mocked(sellerApplicationApi.cancelMyApplication).mockRejectedValue(
      mockError
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCancelSellerApplication(), {
      wrapper,
    });

    let thrownError: Error | undefined;
    await act(async () => {
      await result.current.mutateAsync().catch((e: Error) => (thrownError = e));
    });

    expect(thrownError).toBe(mockError);
  });

  it('실패 시 onboardingStatus 쿼리를 무효화하지 않는다', async () => {
    vi.mocked(sellerApplicationApi.cancelMyApplication).mockRejectedValue(
      new Error('CANCEL_FAILED')
    );

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
