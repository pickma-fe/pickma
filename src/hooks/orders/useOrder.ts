'use client';

import { useQuery } from '@tanstack/react-query';

import type { Order } from '@/types/order';
import { queryKeys } from '@/lib/queryKeys';
import { orderApi } from '@/api/orders/orderApi';

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderApi.getOrder(id),
    enabled: Boolean(id),
  });
}
