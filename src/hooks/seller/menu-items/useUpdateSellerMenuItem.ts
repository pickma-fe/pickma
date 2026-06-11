'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MenuItem, UpdateMenuItemInput } from '@/types/menu-item';
import { queryKeys } from '@/lib/queryKeys';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

interface UpdateSellerMenuItemVariables {
  id: string;
  body: UpdateMenuItemInput;
}

export function useUpdateSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, UpdateSellerMenuItemVariables>({
    mutationFn: ({ id, body }) => sellerMenuItemApi.updateMenuItem(id, body),
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
