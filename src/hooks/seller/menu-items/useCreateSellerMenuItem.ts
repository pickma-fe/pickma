'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateMenuItemInput, MenuItem } from '@/types/menu-item';
import { queryKeys } from '@/lib/queryKeys';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

export function useCreateSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, CreateMenuItemInput>({
    mutationFn: (input) => sellerMenuItemApi.createMenuItem(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sellers.menuItems.all(),
      });
    },
  });
}
