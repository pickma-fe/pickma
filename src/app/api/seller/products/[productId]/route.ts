import type { NextRequest } from 'next/server';
import { z } from 'zod';

import type { UpdateSellerProductRequest } from '@/contracts/product';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockSellerCreatedProduct } from '@/mocks/seller';

const updateSellerProductSchema = z.object({
  discountPrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  endAt: z.string().datetime().optional(),
  pickupStartTime: z.string().datetime().optional(),
  pickupEndTime: z.string().datetime().optional(),
}) satisfies z.ZodType<UpdateSellerProductRequest>;

export async function PATCH(request: NextRequest): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  try {
    await validateBody(updateSellerProductSchema, request);
    return success(mockSellerCreatedProduct);
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  return success(undefined);
}
