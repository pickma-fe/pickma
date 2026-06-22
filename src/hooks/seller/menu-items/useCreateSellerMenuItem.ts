'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateMenuItemInput, MenuItem } from '@/types/menu-item';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

type CreateSellerMenuItemVariables = CreateMenuItemInput & { imageFile?: File };

export function useCreateSellerMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, CreateSellerMenuItemVariables>({
    mutationFn: async ({ imageFile, ...input }) => {
      if (imageFile) {
        const image = await fileApi.uploadFile(
          'seller_product_image',
          imageFile
        );
        return sellerMenuItemApi.createMenuItem({ ...input, image });
      }
      return sellerMenuItemApi.createMenuItem(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sellers.menuItems.all(),
      });
    },
  });
}
