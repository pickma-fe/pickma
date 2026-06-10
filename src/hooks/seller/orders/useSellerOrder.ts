'use client';

import { useQuery } from '@tanstack/react-query';

import type { Order } from '@/types/order';
import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrder(id: string) {
  return useQuery<Order>({
    queryKey: queryKeys.sellers.orders.detail(id),
    queryFn: () => sellerOrderApi.getOrder(id),
    enabled: Boolean(id),
  });
}
