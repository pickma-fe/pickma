import type { PaymentMethod, PaymentStatus } from '@/types/payment';

export interface PreparePaymentRequest {
  orderNumber: string;
  orderName: string;
}

export interface PreparePaymentResponse {
  redirectUrl: string;
  orderNumber: string;
  amount: number;
  expiresAt?: string;
}

export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderNumber: string;
  amount: number;
}

export interface CancelPaymentRequest {
  reason: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
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
