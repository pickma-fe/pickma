import type { JsonValue } from './common';

export type PaymentEventType =
  | 'payment_confirmed'
  | 'payment_compensation_failed'
  | 'payment_stuck_processing'
  | 'payment_webhook_received'
  | 'payment_cancelled';

export type PaymentEventStatus = 'pending' | 'processed' | 'failed';

export interface PaymentCompensationFailedPayload {
  failureStage: 'toss_cancel' | 'revert_processing' | 'cancel_finalize';
  paymentStateAssumption:
    | 'approved_may_remain'
    | 'cancelled_may_be_done'
    | 'toss_cancelled_db_pending';
  manualAction:
    | 'check_toss_and_cancel_or_refund'
    | 'restore_order_status'
    | 'finalize_order_cancel_manually';
  orderStatus: string;
  paymentKey: string | null;
}

export interface PaymentEventRow {
  id: string;
  orderId: string;
  orderNumber: string;
  storeId: string | null;
  paymentId: string | null;
  eventType: PaymentEventType;
  paymentKey: string | null;
  providerEventType: string | null;
  providerEventId: string | null;
  payload: JsonValue | null;
  status: PaymentEventStatus;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
}
