import { z } from 'zod';

import type { CreateFileUploadUrlRequest } from '@/contracts/file';

const FILE_UPLOAD_PURPOSES = [
  'seller_application_document',
  'store_image',
  'seller_product_image',
  'profile_image',
] as const;

const SELLER_APPLICATION_DOCUMENT_TYPES = [
  'business_license',
  'food_service_permit',
  'bank_account',
] as const;

export const createFileUploadUrlSchema = z
  .object({
    purpose: z.enum(FILE_UPLOAD_PURPOSES),
    fileName: z.string().min(1),
    fileSize: z.number().int().positive(),
    mimeType: z.string().min(1),
    documentType: z.enum(SELLER_APPLICATION_DOCUMENT_TYPES).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.purpose === 'seller_application_document' && !data.documentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documentType'],
        message:
          'documentType은 seller_application_document purpose에서 필수입니다.',
      });
    }
  }) satisfies z.ZodType<CreateFileUploadUrlRequest>;
