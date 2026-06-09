import { z } from 'zod';

export const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  keyword: z.string().trim().min(1).max(100).optional(),
  status: z
    .enum([
      'payment_pending',
      'processing',
      'reserved',
      'accepted',
      'ready',
      'completed',
      'cancelled',
      'no_show',
      'expired',
    ])
    .optional(),
  sort: z.enum(['createdAt', 'pickupAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
