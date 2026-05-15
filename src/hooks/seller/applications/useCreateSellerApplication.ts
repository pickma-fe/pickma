'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SellerApplication } from '@/types/seller-application';
import type { CreateSellerApplicationRequest } from '@/contracts/seller-application';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

export function useCreateSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<SellerApplication, Error, CreateSellerApplicationRequest>({
    mutationFn: (body) => sellerApplicationApi.createSellerApplication(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['seller', 'onboarding-status'],
      });
    },
  });
}
