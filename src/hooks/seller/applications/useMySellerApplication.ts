'use client';

import { useQuery } from '@tanstack/react-query';

import type { SellerApplication } from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

export function useMySellerApplication() {
  return useQuery<SellerApplication>({
    queryKey: queryKeys.seller.application.my(),
    queryFn: () => sellerApplicationApi.getMyApplication(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
