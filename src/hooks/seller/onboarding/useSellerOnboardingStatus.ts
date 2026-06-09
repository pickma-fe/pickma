'use client';

import { useQuery } from '@tanstack/react-query';

import type { SellerOnboardingStatus } from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { sellerOnboardingApi } from '@/api/seller/onboarding/sellerOnboardingApi';

interface UseSellerOnboardingStatusOptions {
  enabled?: boolean;
  refetchInterval?:
    | number
    | false
    | ((query: {
        state: { data: SellerOnboardingStatus | undefined };
      }) => number | false);
}

export function useSellerOnboardingStatus(
  options: UseSellerOnboardingStatusOptions = {}
) {
  const { enabled = true, refetchInterval } = options;

  return useQuery<SellerOnboardingStatus>({
    queryKey: queryKeys.seller.onboardingStatus(),
    queryFn: () => sellerOnboardingApi.getSellerOnboardingStatus(),
    staleTime: 30 * 1000,
    enabled,
    retry: false,
    refetchInterval,
  });
}
