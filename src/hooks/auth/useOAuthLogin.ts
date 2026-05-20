'use client';

import { useState } from 'react';

import { authApi } from '@/api/auth/authApi';

type OAuthProvider = 'google' | 'kakao';

interface UseOAuthLoginReturn {
  pendingProvider: OAuthProvider | null;
  error: Error | null;
  signInWithOAuth: (provider: OAuthProvider, redirectPath?: string) => void;
  reset: () => void;
}

export function useOAuthLogin(): UseOAuthLoginReturn {
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  function signInWithOAuth(provider: OAuthProvider, redirectPath?: string) {
    setPendingProvider(provider);
    setError(null);

    const promise =
      provider === 'google'
        ? authApi.signInWithGoogle(redirectPath)
        : authApi.signInWithKakao(redirectPath);

    promise.catch((err: unknown) => {
      setPendingProvider(null);
      setError(err instanceof Error ? err : new Error(String(err)));
    });
  }

  function reset() {
    setPendingProvider(null);
    setError(null);
  }

  return { pendingProvider, error, signInWithOAuth, reset };
}
