'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Order } from '@/types/order';
import type { OrderListParams } from '@/contracts/order';
import { orderApi } from '@/api/orders/orderApi';

export function useOrders(params: OrderListParams) {
  return useQuery<PaginatedResult<Omit<Order, 'items' | 'payment'>>>({
    queryKey: ['orders', 'list', params],
    queryFn: () => orderApi.getOrders(params),
  });
}
