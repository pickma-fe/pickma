import type { Store } from './store';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  pickupTime: string;
  totalAmount: number;
  discountAmount: number;
  paymentAmount: number;
  createdAt: Date;
  store: Store;
  items: OrderItem[];
  payment: Payment | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  pickupTime: string;
  paymentAmount: number;
  createdAt: Date;
  storeName: string;
  itemCount: number;
}
export type OrderStatus =
  | 'reserved'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: Date | null;
}
export type PaymentMethod = 'card' | 'kakao' | 'naver' | 'toss';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
