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

export interface PreparePaymentInput {
  orderNumber: string;
  orderName: string;
}

export interface ConfirmPaymentInput {
  paymentKey: string;
  orderNumber: string;
  amount: number;
}

export interface CancelPaymentInput {
  reason: string;
}
