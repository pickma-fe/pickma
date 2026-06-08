import { z } from 'zod';

import type {
  CancelPaymentRequest,
  ConfirmPaymentRequest,
  PreparePaymentRequest,
} from '@/contracts/payment';

export const preparePaymentSchema = z.object({
  orderNumber: z.string().trim().min(1),
  orderName: z.string().trim().min(1),
}) satisfies z.ZodType<PreparePaymentRequest>;

export const confirmPaymentSchema = z.object({
  paymentKey: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  amount: z.number().int().positive(),
}) satisfies z.ZodType<ConfirmPaymentRequest>;

export const paymentIdSchema = z.uuid();

export const cancelPaymentSchema = z.object({
  reason: z.string().min(1).max(500),
}) satisfies z.ZodType<CancelPaymentRequest>;
