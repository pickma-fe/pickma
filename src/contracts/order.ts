import type { PaginatedResult } from './common';
import type { PaymentResponse } from './payment';

export type OrderStatusParam =
  | 'payment_pending'
  | 'processing'
  | 'reserved'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'cancelling'
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

export interface ConsumerOrderListParams {
  page: number;
  pageSize: number;
  status?: Exclude<OrderStatusParam, 'accepted' | 'processing'>;
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}

export interface SellerOrderListParams {
  page: number;
  pageSize: number;
  status?: Exclude<OrderStatusParam, 'payment_pending' | 'processing'>;
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
  payment?: PaymentResponse;
}
