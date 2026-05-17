'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminSellerApplicationApi } from '@/api/admin/sellers/adminSellerApplicationApi';

export function useApproveSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => adminSellerApplicationApi.approveSellerApplication(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['sellers', 'pending'],
      });
    },
  });
}
