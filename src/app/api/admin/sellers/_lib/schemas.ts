import { z } from 'zod';

import type { RejectSellerApplicationRequest } from '@/contracts/admin';

function isValidCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export const paramsIdSchema = z.object({ id: z.string().uuid() });

export const rejectSellerApplicationSchema = z
  .object({
    reason: z.string().min(1),
  })
  .strict() satisfies z.ZodType<RejectSellerApplicationRequest>;

export const pendingSellerApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  keyword: z.string().trim().min(1).max(100).optional(),
  createdDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isValidCalendarDate)
    .optional(),
  businessCategory: z.string().trim().min(1).max(50).optional(),
});
