'use client';

import { useMutation } from '@tanstack/react-query';

import type { ResetPasswordRequest } from '@/contracts/auth';
import { authApi } from '@/api/auth/authApi';

export function useResetPassword() {
  return useMutation<void, Error, ResetPasswordRequest>({
    mutationFn: (data) => authApi.resetPasswordForEmail(data),
  });
}
