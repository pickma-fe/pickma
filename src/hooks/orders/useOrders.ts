'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { ConsumerOrderListQuery, Order } from '@/types/order';
import { queryKeys } from '@/lib/queryKeys';
import { orderApi } from '@/api/orders/orderApi';

export function useOrders(query: ConsumerOrderListQuery) {
  return useQuery<PaginatedResult<Omit<Order, 'items' | 'payment'>>>({
    queryKey: queryKeys.orders.list(query),
    queryFn: () => orderApi.getOrders(query),
  });
}
