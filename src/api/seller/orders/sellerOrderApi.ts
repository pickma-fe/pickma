import type { Order } from '@/types/order';
import type { PaginatedResult } from '@/contracts/common';
import type {
  OrderDetailResponse,
  OrderListResponse,
  SellerOrderListParams,
} from '@/contracts/order';
import { apiClient } from '@/api/apiClient';

import { mapSellerOrder, mapSellerOrderListItem } from './sellerOrderMapper';

export const sellerOrderApi = {
  getOrders(
    params?: Partial<SellerOrderListParams>
  ): Promise<PaginatedResult<Omit<Order, 'items' | 'payment'>>> {
    return apiClient
      .get<OrderListResponse>('/api/seller/orders', params)
      .then((res) => ({
        ...res,
        items: res.items.map(mapSellerOrderListItem),
      }));
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
};
