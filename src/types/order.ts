import type { Payment } from './payment';

export type OrderStatus =
  | 'paymentPending'
  | 'reserved'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'noShow'
  | 'expired';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  discountAmount: number;
  paymentAmount: number;
  status: OrderStatus;
  pickupAt: Date;
  expiresAt?: Date;
  pickedUpAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  items: OrderItem[];
  payment?: Payment;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListQuery {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}

export interface CreatedOrderPaymentInfo {
  id: string;
  orderNumber: string;
  orderName: string;
  paymentAmount: number;
  expiresAt: Date;
}
