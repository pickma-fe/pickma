export type PaymentMethod = 'card' | 'virtual_account' | 'mobile' | 'easy_pay';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  method: PaymentMethod;
  methodDetail?: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
