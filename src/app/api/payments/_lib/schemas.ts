import { z } from 'zod';

import type {
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
