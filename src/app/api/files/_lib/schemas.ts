import { z } from 'zod';

import type { DeleteFilesRequest } from '@/contracts/file';

export const deleteFilesSchema = z
  .object({
    storagePaths: z.array(z.string().min(1)).min(1).max(50),
  })
  .strict() satisfies z.ZodType<DeleteFilesRequest>;
