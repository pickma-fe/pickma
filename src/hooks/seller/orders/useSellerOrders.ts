'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Order, SellerOrderListQuery } from '@/types/order';
import { queryKeys } from '@/lib/queryKeys';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrders(params?: Partial<SellerOrderListQuery>) {
  return useQuery<PaginatedResult<Omit<Order, 'items' | 'payment'>>>({
    queryKey: queryKeys.sellers.orders.list(params ?? {}),
    queryFn: () => sellerOrderApi.getOrders(params),
  });
}
