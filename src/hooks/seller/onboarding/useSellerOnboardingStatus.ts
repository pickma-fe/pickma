'use client';

import { useQuery } from '@tanstack/react-query';

import type { SellerOnboardingStatus } from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { sellerOnboardingApi } from '@/api/seller/onboarding/sellerOnboardingApi';

export function useSellerOnboardingStatus() {
  return useQuery<SellerOnboardingStatus>({
    queryKey: queryKeys.seller.onboardingStatus(),
    queryFn: () => sellerOnboardingApi.getSellerOnboardingStatus(),
    staleTime: 30 * 1000,
  });
}
