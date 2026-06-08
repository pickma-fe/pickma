import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invalidateTargets } from '@/lib/queryKeys';
import { paymentApi } from '@/api/payments/paymentApi';

import { useCancelPayment } from './useCancelPayment';

vi.mock('@/api/payments/paymentApi', () => ({
  paymentApi: {
    cancelPayment: vi.fn(),
  },
}));

const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return TestWrapper;
}

describe('useCancelPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mutate 호출 시 paymentApi.cancelPayment에 올바른 인수 전달', async () => {
    vi.mocked(paymentApi.cancelPayment).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCancelPayment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        paymentId: 'payment-uuid-1',
        reason: '관리자 취소',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(paymentApi.cancelPayment).toHaveBeenCalledWith('payment-uuid-1', {
      reason: '관리자 취소',
    });
  });

  it('성공 시 afterCancelPayment targets invalidate', async () => {
    vi.mocked(paymentApi.cancelPayment).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCancelPayment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        paymentId: 'payment-uuid-1',
        reason: '관리자 취소',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateTargets.afterCancelPayment.length).toBeGreaterThan(0);
    invalidateTargets.afterCancelPayment.forEach((queryKey) => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
  });

  it('API 실패 시 isError 상태', async () => {
    vi.mocked(paymentApi.cancelPayment).mockRejectedValue(
      new Error('취소 실패')
    );

    const { result } = renderHook(() => useCancelPayment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        paymentId: 'payment-uuid-1',
        reason: '관리자 취소',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
