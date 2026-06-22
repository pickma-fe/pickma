'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MenuItem, UpdateMenuItemInput } from '@/types/menu-item';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

interface UpdateSellerMenuItemVariables {
  id: string;
  body: UpdateMenuItemInput;
  imageFile?: File;
}

export function useUpdateSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, UpdateSellerMenuItemVariables>({
    mutationFn: async ({ id, body, imageFile }) => {
      if (imageFile) {
        const image = await fileApi.uploadFile(
          'seller_product_image',
          imageFile
        );
        return sellerMenuItemApi.updateMenuItem(id, { ...body, image });
      }
      return sellerMenuItemApi.updateMenuItem(id, body);
    },
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
