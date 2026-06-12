import type { PaginatedResult } from '@/types/common';
import type {
  ConsumerOrderListQuery,
  CreatedOrderPaymentInfo,
  CreateOrderInput,
  Order,
  OrderStatus,
} from '@/types/order';
import type {
  ConsumerOrderListParams,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetailResponse,
  OrderListResponse,
} from '@/contracts/order';

import { apiClient } from '../apiClient';
import { mapOrder, mapOrderListItem } from './orderMapper';

const ORDER_STATUS_TO_PARAM = {
  paymentPending: 'payment_pending',
  reserved: 'reserved',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  cancelling: 'cancelling',
  noShow: 'no_show',
  expired: 'expired',
} satisfies Record<
  Exclude<OrderStatus, 'accepted' | 'processing'>,
  ConsumerOrderListParams['status']
>;

function toCreateOrderRequest(input: CreateOrderInput): CreateOrderRequest {
  return {
    ...input,
    pickupAt: input.pickupAt.toISOString(),
  };
}

function toConsumerOrderListParams(
  query: ConsumerOrderListQuery
): ConsumerOrderListParams {
  return {
    ...query,
    status: query.status ? ORDER_STATUS_TO_PARAM[query.status] : undefined,
  };
}

export const orderApi = {
  createOrder(input: CreateOrderInput): Promise<CreatedOrderPaymentInfo> {
    return apiClient
      .post<CreateOrderResponse>('/api/orders', toCreateOrderRequest(input))
      .then((res) => ({
        id: res.id,
        orderNumber: res.orderNumber,
        orderName: res.orderName,
        paymentAmount: res.paymentAmount,
        expiresAt: new Date(res.expiresAt),
      }));
  },

  getOrders(
    query: ConsumerOrderListQuery
  ): Promise<PaginatedResult<Omit<Order, 'items' | 'payment'>>> {
    return apiClient
      .get<OrderListResponse>('/api/orders', toConsumerOrderListParams(query))
      .then((res) => ({ ...res, items: res.items.map(mapOrderListItem) }));
  },

  getOrder(id: string): Promise<Order> {
    return apiClient
      .get<OrderDetailResponse>(`/api/orders/${id}`)
      .then(mapOrder);
  },

  cancelOrder(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/orders/${id}/cancel`);
  },
};
