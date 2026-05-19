'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateStoreInput, MyStore } from '@/types/store';
import type { CreateStoreRequest } from '@/contracts/store';
import { fileApi } from '@/api/files/fileApi';
import { storeApi } from '@/api/stores/storeApi';

type CreateStoreVariables = CreateStoreInput & { imageFile?: File };

function toCreateStoreRequest(input: CreateStoreInput): CreateStoreRequest {
  return { ...input };
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation<MyStore, Error, CreateStoreVariables>({
    mutationFn: async ({ imageFile, ...input }) => {
      if (imageFile) {
        const image = await fileApi.uploadFile('store_image', imageFile);
        return storeApi.createStore(toCreateStoreRequest({ ...input, image }));
      }
      return storeApi.createStore(toCreateStoreRequest(input));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stores', 'my'] });
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
