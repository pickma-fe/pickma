'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateStoreInput, MyStore } from '@/types/store';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { storeApi } from '@/api/stores/storeApi';

type UpdateStoreVariables = UpdateStoreInput & { imageFile?: File };

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation<MyStore, Error, UpdateStoreVariables>({
    mutationFn: async ({ imageFile, ...input }) => {
      if (imageFile) {
        const image = await fileApi.uploadFile('store_image', imageFile);
        return storeApi.updateStore({ ...input, image });
      }
      return storeApi.updateStore(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stores.my() });
    },
  });
}
