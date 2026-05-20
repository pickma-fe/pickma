import { z } from 'zod';

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    profileImage: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: '수정할 필드가 하나 이상 있어야 합니다.',
  });

export type UpdateMeBody = z.infer<typeof updateMeSchema>;
