'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MenuItem } from '@/types/menu-item';
import type { CreateMenuItemRequest } from '@/contracts/menu-item';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

export function useCreateSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, CreateMenuItemRequest>({
    mutationFn: (body) => sellerMenuItemApi.createMenuItem(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['seller', 'menu-items', 'list'],
      });
    },
  });
}
