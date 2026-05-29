'use client';

import { useMutation } from '@tanstack/react-query';

import type {
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
} from '@/contracts/auth';
import { authApi } from '@/api/auth/authApi';

export function useVerifyEmailOtp() {
  return useMutation<VerifyEmailOtpResponse, Error, VerifyEmailOtpRequest>({
    mutationFn: (req) => authApi.verifyEmailOtp(req),
  });
}
