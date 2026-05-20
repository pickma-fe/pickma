'use client';

import { useQuery } from '@tanstack/react-query';

import type { Order } from '@/types/order';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrder(id: string) {
  return useQuery<Order>({
    queryKey: ['seller', 'orders', 'detail', id],
    queryFn: () => sellerOrderApi.getOrder(id),
    enabled: Boolean(id),
  });
}
