'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { SellerDashboardStatsResponse } from '@/contracts/seller';
import { queryKeys } from '@/lib/queryKeys';
import { sellerDashboardApi } from '@/api/seller/dashboard/sellerDashboardApi';

export function useSellerDashboardStats(): UseQueryResult<SellerDashboardStatsResponse> {
  return useQuery<SellerDashboardStatsResponse>({
    queryKey: queryKeys.sellers.dashboard.stats(),
    queryFn: () => sellerDashboardApi.getStats(),
    staleTime: 60 * 1000,
  });
}
