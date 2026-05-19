import { z } from 'zod';

import type { RejectSellerApplicationRequest } from '@/contracts/admin';

export const paramsIdSchema = z.object({ id: z.string().uuid() });

export const rejectSellerApplicationSchema = z
  .object({
    reason: z.string().min(1),
  })
  .strict() satisfies z.ZodType<RejectSellerApplicationRequest>;

export const pendingSellerApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
