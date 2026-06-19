import { z } from 'zod';

import type { SellerOrderListParams } from '@/contracts/order';

export const sellerOrderListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum([
        'reserved',
        'accepted',
        'ready',
        'completed',
        'cancelled',
        'cancelling',
        'no_show',
        'expired',
      ])
      .optional(),
    sort: z.enum(['createdAt', 'pickupAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict() satisfies z.ZodType<SellerOrderListParams>;

export const orderIdSchema = z.uuid();

export const cancelSellerOrderSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});
