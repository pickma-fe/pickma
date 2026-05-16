import { z } from 'zod';

import type {
  ConfirmPaymentRequest,
  PreparePaymentRequest,
} from '@/contracts/payment';

const PAYMENT_PROVIDERS = ['toss', 'kakao_pay', 'naver_pay'] as const;

export const preparePaymentSchema = z.object({
  provider: z.enum(PAYMENT_PROVIDERS),
  orderNumber: z.string().min(1),
}) satisfies z.ZodType<PreparePaymentRequest>;

export const confirmPaymentSchema = z.object({
  provider: z.enum(PAYMENT_PROVIDERS),
  orderNumber: z.string().min(1),
  amount: z.number().int().positive(),
}) satisfies z.ZodType<ConfirmPaymentRequest>;
