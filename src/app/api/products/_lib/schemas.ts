import { z } from 'zod';

import type { ProductListParams } from '@/contracts/product';

const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

export const productListSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    region: z.string().trim().min(1).optional(),
    categoryId: z.string().trim().min(1).optional(),
    discountOption: z
      .enum(['all', 'over-40', '30-to-40', '20-to-30', 'under-20'])
      .optional(),
    sort: z.enum(['endAt', 'discountRate', 'discountPrice']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    availableOnly: booleanQuerySchema.optional(),
  })
  .strict() satisfies z.ZodType<ProductListParams>;

export const productIdSchema = z.uuid();
