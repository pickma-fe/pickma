'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useCompleteSellerOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerOrderApi.completeOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.seller.orders.all(),
      });
    },
  });
}
