import type { NextRequest } from 'next/server';
import { z } from 'zod';

import type { CreateSellerProductRequest } from '@/contracts/product';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockSellerCreatedProduct, mockSellerProducts } from '@/mocks/seller';

const createSellerProductSchema = z.object({
  menuItemId: z.string().min(1),
  discountPrice: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  endAt: z.string().datetime(),
  pickupStartTime: z.string().datetime(),
  pickupEndTime: z.string().datetime(),
}) satisfies z.ZodType<CreateSellerProductRequest>;

export async function GET(): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  return success(mockSellerProducts);
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  try {
    await validateBody(createSellerProductSchema, request);
    return success(mockSellerCreatedProduct, 201);
  } catch (error) {
    return routeError(error);
  }
}
