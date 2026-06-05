import { z } from 'zod';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

export const webhookPaymentStatusChangedSchema = z.object({
  eventType: z.literal('PAYMENT_STATUS_CHANGED'),
  createdAt: z.string(),
  data: z
    .object({
      paymentKey: z.string(),
      orderId: z.string(),
      totalAmount: z.number().int().positive(),
      status: z.string(),
      method: z.string().optional(),
    })
    .passthrough(),
});

export const webhookDepositCallbackSchema = z.object({
  createdAt: z.string(),
  secret: z.string(),
  status: z.string(),
  orderId: z.string(),
  transactionKey: z.string(),
});

export type PaymentStatusChangedBody = z.infer<
  typeof webhookPaymentStatusChangedSchema
>;
export type DepositCallbackBody = z.infer<typeof webhookDepositCallbackSchema>;

export function parseWebhookBody(
  raw: unknown
): PaymentStatusChangedBody | DepositCallbackBody {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'eventType' in raw &&
    (raw as Record<string, unknown>).eventType === 'PAYMENT_STATUS_CHANGED'
  ) {
    const result = webhookPaymentStatusChangedSchema.safeParse(raw);
    if (result.success) return result.data;
  } else {
    const result = webhookDepositCallbackSchema.safeParse(raw);
    if (result.success) return result.data;
  }
  throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
}
