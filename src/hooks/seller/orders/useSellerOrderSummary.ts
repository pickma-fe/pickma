'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { SellerOrderSummary } from '@/types/seller-order';
import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrderSummary(): UseQueryResult<SellerOrderSummary> {
  return useQuery<SellerOrderSummary>({
    queryKey: queryKeys.sellers.orders.summary(),
    queryFn: () => sellerOrderApi.getOrderSummary(),
  });
}
