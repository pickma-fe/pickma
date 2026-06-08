'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { ConsumerOrderListQuery, Order, OrderStatus } from '@/types/order';
import type {
  ConsumerOrderListParams,
  OrderStatusParam,
} from '@/contracts/order';
import { queryKeys } from '@/lib/queryKeys';
import { orderApi } from '@/api/orders/orderApi';

const ORDER_STATUS_TO_PARAM: Record<
  Exclude<OrderStatus, 'accepted' | 'processing'>,
  Exclude<OrderStatusParam, 'accepted' | 'processing'>
> = {
  paymentPending: 'payment_pending',
  reserved: 'reserved',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  cancelling: 'cancelling',
  noShow: 'no_show',
  expired: 'expired',
};

function toOrderListParams(
  query: ConsumerOrderListQuery
): ConsumerOrderListParams {
  return {
    ...query,
    status: query.status ? ORDER_STATUS_TO_PARAM[query.status] : undefined,
  };
}

export function useOrders(query: ConsumerOrderListQuery) {
  return useQuery<PaginatedResult<Omit<Order, 'items' | 'payment'>>>({
    queryKey: queryKeys.orders.list(query),
    queryFn: () => orderApi.getOrders(toOrderListParams(query)),
  });
}
