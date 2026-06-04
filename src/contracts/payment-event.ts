export type PaymentEventType =
  | 'payment_confirmed'
  | 'payment_compensation_failed'
  | 'payment_stuck_processing'
  | 'payment_webhook_received'
  | 'payment_cancelled';

export type PaymentEventStatus = 'pending' | 'processed' | 'failed';

export interface PaymentCompensationFailedPayload {
  failureStage: 'toss_cancel' | 'revert_processing';
  paymentStateAssumption: 'approved_may_remain' | 'cancelled_may_be_done';
  manualAction: 'check_toss_and_cancel_or_refund' | 'restore_order_status';
  orderStatus: string;
  tossPaymentKey: string | null;
}

export interface PaymentEventRow {
  id: string;
  orderId: string;
  orderNumber: string;
  storeId: string | null;
  paymentId: string | null;
  eventType: PaymentEventType;
  provider: string | null;
  providerKey: string | null;
  providerEventType: string | null;
  providerEventId: string | null;
  payload: unknown;
  status: PaymentEventStatus;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
}
