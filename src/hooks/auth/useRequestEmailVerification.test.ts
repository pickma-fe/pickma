import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/api/auth/authApi';
import type { RequestEmailVerificationResponse } from '@/contracts';

import { useRequestEmailVerification } from './useRequestEmailVerification';

vi.mock('@/api/auth/authApi');

const mockResponse: RequestEmailVerificationResponse = {
  challengeId: 'challenge_1',
  expiresAt: '2099-01-01T00:00:00.000Z',
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 }, mutations: { retry: 0 } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return { Wrapper, client };
}

describe('useRequestEmailVerification', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 challengeId를 반환한다', async () => {
    vi.mocked(authApi.requestEmailVerification).mockResolvedValue(mockResponse);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRequestEmailVerification(), {
      wrapper: Wrapper,
    });

    let data: RequestEmailVerificationResponse | undefined;
    await act(async () => {
      data = await result.current.mutateAsync({ email: 'test@example.com' });
    });

    expect(data).toEqual(mockResponse);
  });

  it('실패 시 error를 throw한다', async () => {
    const error = new Error('Rate limit exceeded');
    vi.mocked(authApi.requestEmailVerification).mockRejectedValue(error);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRequestEmailVerification(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutate({ email: 'test@example.com' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
