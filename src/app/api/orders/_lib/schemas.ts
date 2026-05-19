import { z } from 'zod';

import type {
  ConsumerOrderListParams,
  CreateOrderRequest,
} from '@/contracts/order';

export const createOrderSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  pickupAt: z.iso.datetime(),
}) satisfies z.ZodType<CreateOrderRequest>;

export const orderListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum([
        'payment_pending',
        'reserved',
        'ready',
        'completed',
        'cancelled',
        'no_show',
        'expired',
      ])
      .optional(),
    sort: z.enum(['createdAt', 'pickupAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict() satisfies z.ZodType<ConsumerOrderListParams>;

export const orderIdSchema = z.uuid();
