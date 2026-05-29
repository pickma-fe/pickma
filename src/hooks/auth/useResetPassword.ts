'use client';

import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth/authApi';
import type { ResetPasswordRequest } from '@/contracts';

export function useResetPassword() {
  return useMutation<void, Error, ResetPasswordRequest>({
    mutationFn: (data) => authApi.resetPasswordForEmail(data),
  });
}
