'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ConfirmPaymentInput } from '@/types/payment';
import { invalidateTargets } from '@/lib/queryKeys';
import { paymentApi } from '@/api/payments/paymentApi';

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ConfirmPaymentInput>({
    mutationFn: (input) => paymentApi.confirmPayment(input),
    onSuccess: () => {
      invalidateTargets.afterConfirmPayment.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
