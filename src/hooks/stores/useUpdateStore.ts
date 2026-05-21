'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateStoreInput, MyStore } from '@/types/store';
import type { UpdateStoreRequest } from '@/contracts/store';
import { fileApi } from '@/api/files/fileApi';
import { storeApi } from '@/api/stores/storeApi';

type UpdateStoreVariables = UpdateStoreInput & { imageFile?: File };

function toUpdateStoreRequest(input: UpdateStoreInput): UpdateStoreRequest {
  return { ...input };
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation<MyStore, Error, UpdateStoreVariables>({
    mutationFn: async ({ imageFile, ...input }) => {
      if (imageFile) {
        const image = await fileApi.uploadFile('store_image', imageFile);
        return storeApi.updateStore(toUpdateStoreRequest({ ...input, image }));
      }
      return storeApi.updateStore(toUpdateStoreRequest(input));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stores', 'my'] });
    },
  });
}
