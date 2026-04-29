'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreatedOrderPaymentInfo } from '@/types/order';
import type { CreateOrderRequest } from '@/contracts/order';
import { orderApi } from '@/api/orders/orderApi';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<CreatedOrderPaymentInfo, Error, CreateOrderRequest>({
    mutationFn: (body) => orderApi.createOrder(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}
