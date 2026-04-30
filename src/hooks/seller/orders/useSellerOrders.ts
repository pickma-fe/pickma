'use client';

import { useQuery } from '@tanstack/react-query';

import type { Order } from '@/types/order';
import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useSellerOrders() {
  return useQuery<Omit<Order, 'items' | 'payment'>[]>({
    queryKey: ['seller', 'orders', 'list'],
    queryFn: () => sellerOrderApi.getOrders(),
  });
}
