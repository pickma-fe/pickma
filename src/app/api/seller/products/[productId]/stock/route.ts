import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';

import { sellerProductIdSchema } from '../../_lib/schemas';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  const { productId } = await params;

  const parsed = sellerProductIdSchema.safeParse(productId);
  if (!parsed.success) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
      { path: 'productId', message: parsed.error.issues[0].message },
    ]);
  }

  if (isApiMockEnabled()) return success(undefined);

  try {
    await requireSellerStore();
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  } catch (error) {
    return routeError(error);
  }
}
