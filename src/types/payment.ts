export const PAYMENT_PROVIDERS = ['toss', 'kakao_pay', 'naver_pay'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

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
  provider: PaymentProvider;
  providerPaymentKey?: string;
  providerOrderId?: string;
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
