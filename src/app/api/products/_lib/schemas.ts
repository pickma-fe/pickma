import { z } from 'zod';

import type { ProductListParams } from '@/contracts/product';

export const productListSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    region: z.string().trim().min(1).optional(),
  })
  .strict() satisfies z.ZodType<ProductListParams>;

export const productIdSchema = z.uuid();
