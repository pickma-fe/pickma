'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RejectStoreRequest } from '@/contracts/admin';
import { adminStoreApi } from '@/api/admin/stores/adminStoreApi';

interface RejectStoreVariables {
  id: string;
  body: RejectStoreRequest;
}

export function useRejectStore() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RejectStoreVariables>({
    mutationFn: ({ id, body }) => adminStoreApi.rejectStore(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stores', 'admin'] });
    },
  });
}
