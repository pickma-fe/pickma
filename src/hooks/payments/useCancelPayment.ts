'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateTargets } from '@/lib/queryKeys';
import { paymentApi } from '@/api/payments/paymentApi';

interface CancelPaymentVariables {
  paymentId: string;
  reason: string;
}

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelPaymentVariables>({
    mutationFn: ({ paymentId, reason }) =>
      paymentApi.cancelPayment(paymentId, { reason }),
    onSuccess: () => {
      invalidateTargets.afterCancelPayment.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
