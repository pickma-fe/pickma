import type {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from '@/types/payment';
import type { PaymentResponse } from '@/contracts/payment';

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  provider_payment_key: string | null;
  provider_order_id: string | null;
  method: PaymentMethod;
  method_detail: string | null;
  amount: number;
  status: PaymentStatus;
  paid_at: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function mapPaymentRow(
  row: PaymentRow,
  orderNumber: string
): PaymentResponse {
  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber,
    provider: row.provider,
    providerPaymentKey: row.provider_payment_key ?? undefined,
    providerOrderId: row.provider_order_id ?? undefined,
    method: row.method,
    methodDetail: row.method_detail ?? undefined,
    amount: row.amount,
    status: row.status,
    paidAt: row.paid_at ?? undefined,
    refundedAt: row.refunded_at ?? undefined,
    refundReason: row.refund_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
