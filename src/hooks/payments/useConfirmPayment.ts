'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ConfirmPaymentRequest } from '@/contracts/payment';
import { invalidateTargets } from '@/lib/queryKeys';
import { paymentApi } from '@/api/payments/paymentApi';

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ConfirmPaymentRequest>({
    mutationFn: (body) => paymentApi.confirmPayment(body),
    onSuccess: () => {
      invalidateTargets.afterConfirmPayment.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
