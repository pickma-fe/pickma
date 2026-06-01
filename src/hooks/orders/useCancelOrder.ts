'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateTargets } from '@/lib/queryKeys';
import { orderApi } from '@/api/orders/orderApi';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (orderId) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      invalidateTargets.afterCancelOrder.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
