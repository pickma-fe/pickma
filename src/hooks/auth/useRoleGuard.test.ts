import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/types/user';
import { ApiError } from '@/api/apiClient';
import { userApi } from '@/api/users/userApi';

import { useRoleGuard } from './useRoleGuard';

vi.mock('@/api/users/userApi');

const mockSeller: User = {
  id: 'user_seller',
  email: 'seller@example.com',
  name: '픽마 판매자',
  role: 'seller',
  status: 'active',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockCustomer: User = {
  ...mockSeller,
  id: 'user_customer',
  email: 'customer@example.com',
  name: '픽마 고객',
  role: 'customer',
};

const mockAdmin: User = {
  ...mockSeller,
  id: 'user_admin',
  email: 'admin@example.com',
  name: '픽마 관리자',
  role: 'admin',
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retryDelay: 0, retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return Wrapper;
}

describe('useRoleGuard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 중에는 status: loading을 반환한다', () => {
    vi.mocked(userApi.getMe).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('loading');
  });

  it('모든 status에서 refetch를 반환한다', async () => {
    vi.mocked(userApi.getMe).mockResolvedValue(mockSeller);

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('ok'));

    expect(typeof result.current.refetch).toBe('function');
  });

  it('ApiError 401 → status: unauthorized', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.')
    );

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('unauthorized'));
    if (result.current.status === 'unauthorized') {
      expect(result.current.error).toBeInstanceOf(ApiError);
    }
  });

  it('ApiError 403 → status: forbidden', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(403, 'FORBIDDEN', '접근 권한이 없습니다.')
    );

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('forbidden'));
  });

  it('network/5xx 오류 → status: error (redirect 대상 아님)', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', '서버 오류')
    );

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    if (result.current.status === 'error') {
      expect(result.current.error).toBeInstanceOf(ApiError);
    }
  });

  it('role 불일치 → status: forbidden', async () => {
    vi.mocked(userApi.getMe).mockResolvedValue(mockCustomer);

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('forbidden'));
    if (result.current.status === 'forbidden') {
      expect(result.current.user).toEqual(mockCustomer);
    }
  });

  it('role 일치 → status: ok, user 반환', async () => {
    vi.mocked(userApi.getMe).mockResolvedValue(mockSeller);

    const { result } = renderHook(() => useRoleGuard('seller'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('ok'));
    if (result.current.status === 'ok') {
      expect(result.current.user).toEqual(mockSeller);
    }
  });

  it('admin role guard — role 일치 → status: ok', async () => {
    vi.mocked(userApi.getMe).mockResolvedValue(mockAdmin);

    const { result } = renderHook(() => useRoleGuard('admin'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('ok'));
    if (result.current.status === 'ok') {
      expect(result.current.user).toEqual(mockAdmin);
    }
  });

  it('enabled=false → role 판정 skip, user와 refetch를 반환하며 status: ok', async () => {
    vi.mocked(userApi.getMe).mockResolvedValue(mockCustomer);

    const { result } = renderHook(() => useRoleGuard('seller', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('ok'));
    if (result.current.status === 'ok') {
      expect(result.current.user).toEqual(mockCustomer);
    }
    expect(typeof result.current.refetch).toBe('function');
  });

  it('enabled=false + 401 → redirect 없이 status: ok (공개 라우트 auth 에러 무시)', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.')
    );

    const { result } = renderHook(() => useRoleGuard('seller', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('ok'));
    if (result.current.status === 'ok') {
      expect(result.current.user).toBeUndefined();
    }
  });

  it('enabled=false + 5xx → status: error (서버 오류는 ok로 삼키지 않음)', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', '서버 오류')
    );

    const { result } = renderHook(() => useRoleGuard('seller', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
