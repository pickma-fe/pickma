import { z } from 'zod';

import type {
  CreateMenuItemRequest,
  SellerMenuItemListParams,
  UpdateMenuItemRequest,
} from '@/contracts/menu-item';

export const sellerMenuItemListSchema = z
  .object({
    categoryId: z.uuid().optional(),
    keyword: z.string().trim().min(1).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .strict() satisfies z.ZodType<SellerMenuItemListParams>;

export const createMenuItemSchema = z
  .object({
    categoryId: z.uuid(),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).optional(),
    image: z.string().trim().min(1).optional(),
    originalPrice: z.number().int().positive(),
  })
  .strict() satisfies z.ZodType<CreateMenuItemRequest>;

export const updateMenuItemSchema = z
  .object({
    categoryId: z.uuid().optional(),
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).optional(),
    image: z.string().trim().min(1).optional(),
    originalPrice: z.number().int().positive().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .strict()
  .refine((body) => Object.values(body).some((v) => v !== undefined), {
    message: '수정할 필드를 1개 이상 입력해야 합니다.',
  }) satisfies z.ZodType<UpdateMenuItemRequest>;

export const menuItemIdSchema = z.uuid();
