import type { PaginatedResult } from '@/types/common';
import type { Order, OrderStatus, SellerOrderListQuery } from '@/types/order';
import type { SellerOrderSummary } from '@/types/seller-order';
import type {
  OrderDetailResponse,
  OrderListResponse,
  SellerOrderListParams,
  SellerOrderSummaryResponse,
} from '@/contracts/order';
import { apiClient } from '@/api/apiClient';

import {
  mapSellerOrder,
  mapSellerOrderListItem,
  mapSellerOrderSummary,
} from './sellerOrderMapper';

const ORDER_STATUS_TO_PARAM: Record<
  Exclude<OrderStatus, 'paymentPending' | 'processing'>,
  SellerOrderListParams['status']
> = {
  reserved: 'reserved',
  accepted: 'accepted',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  cancelling: 'cancelling',
  noShow: 'no_show',
  expired: 'expired',
};

function toSellerOrderListParams(
  query?: Partial<SellerOrderListQuery>
): Partial<SellerOrderListParams> | undefined {
  if (!query) {
    return undefined;
  }

  return {
    ...query,
    status: query.status ? ORDER_STATUS_TO_PARAM[query.status] : undefined,
  };
}

export const sellerOrderApi = {
  getOrders(
    query?: Partial<SellerOrderListQuery>
  ): Promise<PaginatedResult<Omit<Order, 'items' | 'payment'>>> {
    return apiClient
      .get<OrderListResponse>(
        '/api/seller/orders',
        toSellerOrderListParams(query)
      )
      .then((res) => ({
        ...res,
        items: res.items.map(mapSellerOrderListItem),
      }));
  },

  getOrderSummary(): Promise<SellerOrderSummary> {
    return apiClient
      .get<SellerOrderSummaryResponse>('/api/seller/orders/summary')
      .then(mapSellerOrderSummary);
  },

  getOrder(id: string): Promise<Order> {
    return apiClient
      .get<OrderDetailResponse>(`/api/seller/orders/${id}`)
      .then(mapSellerOrder);
  },

  acceptOrder(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/seller/orders/${id}/accept`);
  },

  markOrderReady(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/seller/orders/${id}/ready`);
  },

  completeOrder(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/seller/orders/${id}/complete`);
  },

  noShowOrder(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/seller/orders/${id}/no-show`);
  },

  cancelOrder(id: string, reason: string): Promise<void> {
    return apiClient.patch<void>(`/api/seller/orders/${id}/cancel`, { reason });
  },
};
