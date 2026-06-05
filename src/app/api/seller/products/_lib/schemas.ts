import { z } from 'zod';

import type {
  CreateSellerProductRequest,
  UpdateSellerProductRequest,
  UpdateSellerProductStockRequest,
} from '@/contracts/product';

const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  .transform((value) => (value.length === 5 ? `${value}:00` : value));

export const createSellerProductSchema = z
  .object({
    menuItemId: z.uuid(),
    discountPrice: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    endAt: z.iso.datetime(),
    pickupStartTime: timeStringSchema,
    pickupEndTime: timeStringSchema,
  })
  .strict() satisfies z.ZodType<CreateSellerProductRequest>;

export const updateSellerProductSchema = z
  .object({
    discountPrice: z.number().int().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    endAt: z.iso.datetime().optional(),
    pickupStartTime: timeStringSchema.optional(),
    pickupEndTime: timeStringSchema.optional(),
    status: z.enum(['active', 'closed']).optional(),
  })
  .strict()
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: '수정할 필드를 1개 이상 입력해야 합니다.',
  }) satisfies z.ZodType<UpdateSellerProductRequest>;

export const updateSellerProductStockSchema = z
  .object({
    stock: z.number().int().nonnegative(),
  })
  .strict() satisfies z.ZodType<UpdateSellerProductStockRequest>;

export const sellerProductIdSchema = z.uuid();
