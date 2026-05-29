'use client';

import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth/authApi';
import type {
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
} from '@/contracts';

export function useVerifyEmailOtp() {
  return useMutation<VerifyEmailOtpResponse, Error, VerifyEmailOtpRequest>({
    mutationFn: (req) => authApi.verifyEmailOtp(req),
  });
}
