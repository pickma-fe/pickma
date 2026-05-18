'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MenuItem } from '@/types/menu-item';
import type { UpdateMenuItemRequest } from '@/contracts/menu-item';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

interface UpdateSellerMenuItemVariables {
  id: string;
  body: UpdateMenuItemRequest;
}

export function useUpdateSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, UpdateSellerMenuItemVariables>({
    mutationFn: ({ id, body }) => sellerMenuItemApi.updateMenuItem(id, body),
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
