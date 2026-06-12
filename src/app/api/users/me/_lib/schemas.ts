import { z } from 'zod';

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: z
      .preprocess(
        (value) =>
          typeof value === 'string' && value.trim() === '' ? null : value,
        z.string().trim().max(30).nullable()
      )
      .optional(),
    profileImage: z.string().trim().min(1).optional(),
    locationLat: z.number().gte(-90).lte(90).nullable().optional(),
    locationLng: z.number().gte(-180).lte(180).nullable().optional(),
    locationAddress: z
      .preprocess(
        (value) =>
          typeof value === 'string' && value.trim() === '' ? null : value,
        z.string().trim().max(255).nullable()
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: '수정할 필드가 하나 이상 있어야 합니다.',
  });

export type UpdateMeBody = z.infer<typeof updateMeSchema>;
