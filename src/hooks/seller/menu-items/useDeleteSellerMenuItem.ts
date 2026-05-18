'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

export function useDeleteSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerMenuItemApi.deleteMenuItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['menu-items', 'seller'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['products', 'seller', 'list'],
      });
    },
  });
}
