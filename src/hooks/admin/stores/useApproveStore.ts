'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminStoreApi } from '@/api/admin/stores/adminStoreApi';

export function useApproveStore() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => adminStoreApi.approveStore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
    },
  });
}
