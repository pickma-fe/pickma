import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AuthResult } from '@/types/auth';
import { queryKeys } from '@/lib/queryKeys';
import { authApi } from '@/api/auth/authApi';

import { useEmailLogin } from './useEmailLogin';

vi.mock('@/api/auth/authApi');

const mockAuthResult: AuthResult = {
  user: { id: 'user_1', email: 'admin@example.com', provider: 'email' },
  session: {
    user: { id: 'user_1', email: 'admin@example.com', provider: 'email' },
    expiresAt: 9999999999,
  },
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

describe('useEmailLogin', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 users.me 쿼리를 invalidate한다', async () => {
    vi.mocked(authApi.signInWithEmail).mockResolvedValue(mockAuthResult);

    const { Wrapper, client } = createWrapper();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useEmailLogin(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        email: 'admin@example.com',
        password: 'password',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.users.me(),
    });
  });

  it('실패 시 error를 throw한다', async () => {
    const error = new Error('Invalid login credentials');
    vi.mocked(authApi.signInWithEmail).mockRejectedValue(error);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useEmailLogin(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutate({
        email: 'wrong@example.com',
        password: 'wrong',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
