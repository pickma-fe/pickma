'use client';

import { useQuery } from '@tanstack/react-query';

import type { SellerOrderSummaryResponse } from '@/contracts/order';
import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrderSummary() {
  return useQuery<SellerOrderSummaryResponse>({
    queryKey: queryKeys.sellers.orders.summary(),
    queryFn: () => sellerOrderApi.getOrderSummary(),
  });
}
