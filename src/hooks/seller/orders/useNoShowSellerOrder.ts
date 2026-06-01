'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useNoShowSellerOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (orderId) => sellerOrderApi.noShowOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.seller.orders.all(),
      });
    },
  });
}
