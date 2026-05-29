import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/api/auth/authApi';
import type { VerifyEmailOtpResponse } from '@/contracts';

import { useVerifyEmailOtp } from './useVerifyEmailOtp';

vi.mock('@/api/auth/authApi');

const mockResponse: VerifyEmailOtpResponse = {
  verificationToken: 'token_abc',
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

describe('useVerifyEmailOtp', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 verificationToken을 반환한다', async () => {
    vi.mocked(authApi.verifyEmailOtp).mockResolvedValue(mockResponse);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useVerifyEmailOtp(), {
      wrapper: Wrapper,
    });

    let data: VerifyEmailOtpResponse | undefined;
    await act(async () => {
      data = await result.current.mutateAsync({
        email: 'test@example.com',
        otp: '123456',
      });
    });

    expect(data).toEqual(mockResponse);
  });

  it('실패 시 error를 throw한다', async () => {
    const error = new Error('OTP invalid');
    vi.mocked(authApi.verifyEmailOtp).mockRejectedValue(error);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useVerifyEmailOtp(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutate({ email: 'test@example.com', otp: '000000' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
