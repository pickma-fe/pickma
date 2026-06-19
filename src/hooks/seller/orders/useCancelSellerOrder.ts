'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useCancelSellerOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => sellerOrderApi.cancelOrder(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sellers.orders.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerList(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerDetails(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.details(),
      });
    },
  });
}
