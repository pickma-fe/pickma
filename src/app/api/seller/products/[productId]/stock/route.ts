import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockSellerCreatedProduct } from '@/mocks/seller';

import {
  sellerProductIdSchema,
  updateSellerProductStockSchema,
} from '../../_lib/schemas';
import { updateSellerProductStock } from '../../_lib/service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  const { productId } = await params;

  const parsed = sellerProductIdSchema.safeParse(productId);
  if (!parsed.success) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
      { path: 'productId', message: parsed.error.issues[0].message },
    ]);
  }

  try {
    const body = await validateBody(updateSellerProductStockSchema, request);

    if (isApiMockEnabled()) return success(mockSellerCreatedProduct);

    const { store } = await requireSellerStore();
    const data = await updateSellerProductStock(
      store.id,
      parsed.data,
      body.stock
    );
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
