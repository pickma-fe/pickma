import type { PaginatedResult } from './common';

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
  pickupAt: string;
}

export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  orderName: string;
  paymentAmount: number;
  expiresAt: string;
}

export interface OrderListParams {
  page: number;
  pageSize: number;
  status?: string;
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}

export interface OrderListItemResponse {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  discountAmount: number;
  paymentAmount: number;
  status:
    | 'payment_pending'
    | 'reserved'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'expired';
  pickupAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderListResponse = PaginatedResult<OrderListItemResponse>;
