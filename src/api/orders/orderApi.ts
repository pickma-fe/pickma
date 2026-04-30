import type { PaginatedResult } from '@/types/common';
import type { CreatedOrderPaymentInfo, Order } from '@/types/order';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetailResponse,
  OrderListParams,
  OrderListResponse,
} from '@/contracts/order';

import { apiClient } from '../apiClient';
import { mapOrder, mapOrderListItem } from './orderMapper';

export const orderApi = {
  createOrder(body: CreateOrderRequest): Promise<CreatedOrderPaymentInfo> {
    return apiClient
      .post<CreateOrderResponse>('/api/orders', body)
      .then((res) => ({
        id: res.id,
        orderNumber: res.orderNumber,
        orderName: res.orderName,
        paymentAmount: res.paymentAmount,
        expiresAt: new Date(res.expiresAt),
      }));
  },

  getOrders(
    params: OrderListParams
  ): Promise<PaginatedResult<Omit<Order, 'items' | 'payment'>>> {
    return apiClient
      .get<OrderListResponse>('/api/orders', params)
      .then((res) => ({ ...res, items: res.items.map(mapOrderListItem) }));
  },

  getOrder(id: string): Promise<Order> {
    return apiClient
      .get<OrderDetailResponse>(`/api/orders/${id}`)
      .then(mapOrder);
  },
};
