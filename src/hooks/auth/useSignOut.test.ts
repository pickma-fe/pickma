import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/api/auth/authApi';

import { useSignOut } from './useSignOut';

vi.mock('@/api/auth/authApi');

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 }, mutations: { retry: 0 } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return { Wrapper, client };
}

describe('useSignOut', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 전체 쿼리 캐시를 초기화한다', async () => {
    vi.mocked(authApi.signOut).mockResolvedValue(undefined);

    const { Wrapper, client } = createWrapper();
    const clearSpy = vi.spyOn(client, 'clear');

    const { result } = renderHook(() => useSignOut(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(clearSpy).toHaveBeenCalledOnce();
  });

  it('실패 시 error를 throw한다', async () => {
    const error = new Error('Network error');
    vi.mocked(authApi.signOut).mockRejectedValue(error);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSignOut(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
