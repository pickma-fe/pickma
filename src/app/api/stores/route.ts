import type { NextRequest } from 'next/server';
import { z } from 'zod';

import type { CreateStoreRequest } from '@/contracts/store';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockPendingStore } from '@/mocks/stores';

const createStoreSchema = z.object({
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

export async function POST(request: NextRequest): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  try {
    await validateBody(createStoreSchema, request);
    return success(mockPendingStore, 201);
  } catch (error) {
    return routeError(error);
  }
}
