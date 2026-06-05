import { z } from 'zod';

export const adminStoresQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  keyword: z.string().trim().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  region: z.string().trim().min(1).max(50).optional(),
});
