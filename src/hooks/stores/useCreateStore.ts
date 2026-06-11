'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateStoreInput, MyStore } from '@/types/store';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { storeApi } from '@/api/stores/storeApi';

type CreateStoreVariables = CreateStoreInput & { imageFile?: File };

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation<MyStore, Error, CreateStoreVariables>({
    mutationFn: async ({ imageFile, ...input }) => {
      if (imageFile) {
        const image = await fileApi.uploadFile('store_image', imageFile);
        return storeApi.createStore({ ...input, image });
      }
      return storeApi.createStore(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stores.my() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
