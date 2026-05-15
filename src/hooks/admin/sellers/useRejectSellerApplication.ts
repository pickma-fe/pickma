'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminSellerApplicationApi } from '@/api/admin/sellers/adminSellerApplicationApi';

export function useRejectSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) =>
      adminSellerApplicationApi.rejectSellerApplication(id, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'sellers', 'pending'],
      });
    },
  });
}
