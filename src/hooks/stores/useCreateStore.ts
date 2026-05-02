'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateStoreInput, MyStore } from '@/types/store';
import type { CreateStoreRequest } from '@/contracts/store';
import { storeApi } from '@/api/stores/storeApi';

function toCreateStoreRequest(input: CreateStoreInput): CreateStoreRequest {
  return { ...input };
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation<MyStore, Error, CreateStoreInput>({
    mutationFn: (input) => storeApi.createStore(toCreateStoreRequest(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stores', 'my'] });
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
