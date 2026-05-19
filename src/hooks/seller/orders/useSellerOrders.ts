'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Order } from '@/types/order';
import type { SellerOrderListParams } from '@/contracts/order';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrders(params?: Partial<SellerOrderListParams>) {
  return useQuery<PaginatedResult<Omit<Order, 'items' | 'payment'>>>({
    queryKey: ['seller', 'orders', 'list', params ?? {}],
    queryFn: () => sellerOrderApi.getOrders(params),
  });
}
