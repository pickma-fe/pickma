'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

export function useDeleteSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerMenuItemApi.deleteMenuItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sellers.menuItems.all(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerList(),
      });
    },
  });
}
