import type { PaginatedResult } from './common';

export type OrderStatusParam =
  | 'payment_pending'
  | 'reserved'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'expired';

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
  status?: OrderStatusParam;
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
  status: OrderStatusParam;
  pickupAt: string;
  pickupServiceDate: string;
  storeOrderNumber?: string;
  pickupNumber?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderListResponse = PaginatedResult<OrderListItemResponse>;

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
}

export interface OrderDetailResponse extends OrderListItemResponse {
  cancelledAt?: string;
  cancelReason?: string;
  pickedUpAt?: string;
  items: OrderItemResponse[];
}
