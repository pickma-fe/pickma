import type {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from '@/types/payment';

export type { PaymentProvider };

export type PaymentFlow = 'redirect';

export interface PreparePaymentRequest {
  provider: PaymentProvider;
  orderNumber: string;
}

export interface PreparePaymentResponse {
  provider: PaymentProvider;
  flow: PaymentFlow;
  redirectUrl: string;
  orderNumber: string;
  amount: number;
  expiresAt?: string;
}

export interface ConfirmPaymentRequest {
  provider: PaymentProvider;
  orderNumber: string;
  amount: number;
}

export interface PaymentResponse {
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
  paidAt?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}
