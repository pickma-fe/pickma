'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreatedOrderPaymentInfo, CreateOrderInput } from '@/types/order';
import { invalidateTargets } from '@/lib/queryKeys';
import { orderApi } from '@/api/orders/orderApi';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<CreatedOrderPaymentInfo, Error, CreateOrderInput>({
    mutationFn: (input) => orderApi.createOrder(input),
    onSuccess: () => {
      invalidateTargets.afterCreateOrder.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
