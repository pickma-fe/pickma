import { z } from 'zod';

import type { CreateSellerApplicationRequest } from '@/contracts/seller-application';

const DOCUMENT_TYPES = [
  'business_license',
  'food_service_permit',
  'bank_account',
] as const;

const documentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  storagePath: z.string().min(1),
  originalFileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
});

export const createSellerApplicationSchema = z
  .object({
    businessNumber: z.string().min(1),
    companyName: z.string().min(1),
    representativeName: z.string().min(1),
    businessAddress: z.string().min(1),
    businessType: z.string().min(1),
    businessCategory: z.string().min(1),
    documents: z.array(documentSchema).length(3),
  })
  .strict()
  .superRefine((data, ctx) => {
    const types = data.documents.map((d) => d.type);
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size !== DOCUMENT_TYPES.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documents'],
        message:
          'documents는 business_license, food_service_permit, bank_account를 각각 1개씩 포함해야 합니다.',
      });
    }
  }) satisfies z.ZodType<CreateSellerApplicationRequest>;
