import { z } from 'zod';

import type { CreateStoreRequest } from '@/contracts/store';

export const createStoreSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  businessNumber: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  address: z.string().trim().min(1),
  addressDetail: z.string().trim().min(1).optional(),
  region: z.string().trim().min(1),
  image: z.string().trim().min(1).optional(),
  openTime: z.iso.time().optional(),
  closeTime: z.iso.time().optional(),
}) satisfies z.ZodType<CreateStoreRequest>;
