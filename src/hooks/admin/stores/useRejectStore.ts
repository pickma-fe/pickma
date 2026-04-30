'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminStoreApi } from '@/api/admin/stores/adminStoreApi';

interface RejectStoreInput {
  id: string;
  reason: string;
}

export function useRejectStore() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RejectStoreInput>({
    mutationFn: ({ id, reason }) => adminStoreApi.rejectStore(id, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stores', 'admin'] });
    },
  });
}
