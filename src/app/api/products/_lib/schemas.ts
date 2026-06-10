import { z } from 'zod';

import type { ProductListParams } from '@/contracts/product';

const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

const optionalNumberQuerySchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}, z.coerce.number().int().optional());

const optionalFloatQuerySchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}, z.coerce.number().optional());

export const productListSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    userLat: optionalFloatQuerySchema.pipe(
      z.number().min(-90).max(90).optional()
    ),
    userLng: optionalFloatQuerySchema.pipe(
      z.number().min(-180).max(180).optional()
    ),
    categoryId: z.string().trim().min(1).optional(),
    keyword: z.string().trim().min(1).optional(),
    minPrice: optionalNumberQuerySchema.refine(
      (value) => value === undefined || value >= 0
    ),
    maxPrice: optionalNumberQuerySchema.refine(
      (value) => value === undefined || value > 0
    ),
    discountOption: z
      .enum(['all', 'over-40', '30-to-40', '20-to-30', 'under-20'])
      .optional(),
    sort: z
      .enum(['endAt', 'discountRate', 'discountPrice', 'distance'])
      .optional(),
    order: z.enum(['asc', 'desc']).optional(),
    availableOnly: booleanQuerySchema.optional(),
  })
  .refine(
    (params) =>
      params.minPrice === undefined ||
      params.maxPrice === undefined ||
      params.minPrice < params.maxPrice,
    {
      message: 'minPrice는 maxPrice보다 작아야 합니다.',
      path: ['minPrice'],
    }
  )
  .strict() satisfies z.ZodType<ProductListParams>;

export const productIdSchema = z.uuid();
