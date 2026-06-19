import type { Payment } from './payment';

export type OrderStatus =
  | 'paymentPending'
  | 'processing'
  | 'reserved'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'cancelling'
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
  image?: string;
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
  image?: string;
  pickupAt: Date;
  pickupServiceDate: Date;
  storeOrderNumber?: string;
  pickupNumber?: string;
  expiresAt?: Date;
  pickedUpAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  items: OrderItem[];
  payment?: Payment;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsumerOrderListQuery {
  page: number;
  pageSize: number;
  status?: Exclude<OrderStatus, 'accepted' | 'processing'>;
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}

export interface SellerOrderListQuery {
  page: number;
  pageSize: number;
  status?: Exclude<OrderStatus, 'paymentPending' | 'processing'>;
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}

export interface CreateOrderInput {
  productId: string;
  quantity: number;
  pickupAt: Date;
}

export interface CreatedOrderPaymentInfo {
  id: string;
  orderNumber: string;
  orderName: string;
  paymentAmount: number;
  expiresAt: Date;
}
