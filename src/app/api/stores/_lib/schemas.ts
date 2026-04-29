import { z } from 'zod';

import type { CreateStoreRequest } from '@/contracts/store';

export const createStoreSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  businessNumber: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  addressDetail: z.string().min(1).optional(),
  region: z.string().min(1),
  image: z.string().min(1).optional(),
  openTime: z.string().datetime().optional(),
  closeTime: z.string().datetime().optional(),
}) satisfies z.ZodType<CreateStoreRequest>;
