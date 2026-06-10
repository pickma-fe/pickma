import { z } from 'zod';

import type { CreateStoreRequest, UpdateStoreRequest } from '@/contracts/store';

export const updateStoreSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    address: z.string().trim().min(1).optional(),
    addressDetail: z.string().trim().min(1).optional(),
    region: z.string().trim().min(1).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    image: z.string().trim().min(1).optional(),
    openTime: z.iso.time().optional(),
    closeTime: z.iso.time().optional(),
    operationStatus: z.enum(['open', 'closed']).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: '수정할 필드가 없습니다.',
  }) satisfies z.ZodType<UpdateStoreRequest>;

export const createStoreSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  businessNumber: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  address: z.string().trim().min(1),
  addressDetail: z.string().trim().min(1).optional(),
  region: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  image: z.string().trim().min(1).optional(),
  openTime: z.iso.time().optional(),
  closeTime: z.iso.time().optional(),
}) satisfies z.ZodType<CreateStoreRequest>;
