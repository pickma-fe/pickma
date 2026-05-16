'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Order, OrderListQuery, OrderStatus } from '@/types/order';
import type { OrderListParams, OrderStatusParam } from '@/contracts/order';
import { orderApi } from '@/api/orders/orderApi';

const ORDER_STATUS_TO_PARAM: Record<OrderStatus, OrderStatusParam> = {
  paymentPending: 'payment_pending',
  processing: 'processing',
  reserved: 'reserved',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  noShow: 'no_show',
  expired: 'expired',
};

function toOrderListParams(query: OrderListQuery): OrderListParams {
  return {
    ...query,
    status: query.status ? ORDER_STATUS_TO_PARAM[query.status] : undefined,
  };
}

export function useOrders(query: OrderListQuery) {
  return useQuery<PaginatedResult<Omit<Order, 'items' | 'payment'>>>({
    queryKey: ['orders', 'list', query],
    queryFn: () => orderApi.getOrders(toOrderListParams(query)),
  });
}
