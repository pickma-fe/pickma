'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MyStore } from '@/types/store';
import type { CreateStoreRequest } from '@/contracts/store';
import { storeApi } from '@/api/stores/storeApi';

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation<MyStore, Error, CreateStoreRequest>({
    mutationFn: (body) => storeApi.createStore(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stores', 'my'] });
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
