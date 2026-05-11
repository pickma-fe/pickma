import { z } from 'zod';

import type { CreateOrderRequest } from '@/contracts/order';

export const createOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  pickupAt: z.string().datetime(),
}) satisfies z.ZodType<CreateOrderRequest>;
