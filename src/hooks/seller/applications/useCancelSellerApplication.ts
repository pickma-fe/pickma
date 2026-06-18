'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

export function useCancelSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => sellerApplicationApi.cancelMyApplication(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sellers.onboardingStatus(),
      });
    },
  });
}
