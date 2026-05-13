import { z } from 'zod';

import type { ProductListParams } from '@/contracts/product';

export const productListSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    region: z.string().trim().min(1).optional(),
    categoryId: z.string().trim().min(1).optional(),
    discountOption: z
      .enum(['all', 'over-40', '30-to-40', '20-to-30', 'under-20'])
      .optional(),
    sortOption: z.enum(['deadline', 'discount-rate', 'price-low']).optional(),
    availableOnly: z.coerce.boolean().optional(),
  })
  .strict() satisfies z.ZodType<ProductListParams>;

export const productIdSchema = z.uuid();
