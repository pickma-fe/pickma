import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/types/user';
import { queryKeys } from '@/lib/queryKeys';
import { ApiError } from '@/api/apiClient';
import { userApi } from '@/api/users/userApi';

import { useMe } from './useMe';

vi.mock('@/api/users/userApi');

const mockUser: User = {
  id: 'user_1',
  email: 'customer@example.com',
  name: '픽마 고객',
  phone: '010-1234-5678',
  profileImage: '/images/mock/profile.jpg',
  role: 'customer',
  status: 'active',
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  updatedAt: new Date('2026-04-20T00:00:00.000Z'),
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retryDelay: 0 },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return Wrapper;
}

describe('useMe', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 users.me queryKey로 User를 반환한다', async () => {
    vi.mocked(userApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUser);
  });

  it('ApiError(401, UNAUTHORIZED) - retry 없이 즉시 error 상태', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.')
    );

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(vi.mocked(userApi.getMe)).toHaveBeenCalledTimes(1);
  });

  it('ApiError(401, OTHER_CODE) - statusCode 기준으로 retry 없이 즉시 error 상태', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(401, 'OTHER_CODE', 'Unauthorized')
    );

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(vi.mocked(userApi.getMe)).toHaveBeenCalledTimes(1);
  });

  it('ApiError(500, INTERNAL_SERVER_ERROR) - 기본 retry 동작 유지', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', '서버 오류가 발생했습니다.')
    );

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(vi.mocked(userApi.getMe).mock.calls.length).toBeGreaterThanOrEqual(
      4
    );
  });

  it('queryKey가 queryKeys.users.me()와 일치한다', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retryDelay: 0 } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);

    renderHook(() => useMe(), { wrapper: Wrapper });

    const queries = client.getQueryCache().getAll();
    expect(queries[0].queryKey).toEqual(queryKeys.users.me());
    expect(queries[0].queryKey).toEqual(['users', 'me']);
  });
});
