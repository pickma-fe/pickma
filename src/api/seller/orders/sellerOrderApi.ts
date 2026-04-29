import type { Order } from '@/types/order';
import type {
  OrderDetailResponse,
  OrderListItemResponse,
} from '@/contracts/order';
import { apiClient } from '@/api/apiClient';

import { mapSellerOrder, mapSellerOrderListItem } from './sellerOrderMapper';

export const sellerOrderApi = {
  getOrders(): Promise<Omit<Order, 'items' | 'payment'>[]> {
    return apiClient
      .get<OrderListItemResponse[]>('/api/seller/orders')
      .then((items) => items.map(mapSellerOrderListItem));
  },

  getOrder(id: string): Promise<Order> {
    return apiClient
      .get<OrderDetailResponse>(`/api/seller/orders/${id}`)
      .then(mapSellerOrder);
  },

  completeOrder(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/seller/orders/${id}/complete`);
  },
};
