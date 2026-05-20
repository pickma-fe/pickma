import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockSellerCreatedProduct } from '@/mocks/seller';

import {
  sellerProductIdSchema,
  updateSellerProductSchema,
} from '../_lib/schemas';
import { deleteSellerProduct, updateSellerProduct } from '../_lib/service';

function validateProductId(productId: string) {
  const parsed = sellerProductIdSchema.safeParse(productId);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: fail(
        ERROR_CODE.VALIDATION_ERROR,
        400,
        parsed.error.issues.map((issue) => ({
          path: issue.path.length ? issue.path.join('.') : 'productId',
          message: issue.message,
        }))
      ),
    };
  }

  return { ok: true as const, productId: parsed.data };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  const { productId } = await params;
  const parsedProductId = validateProductId(productId);
  if (!parsedProductId.ok) return parsedProductId.response;

  try {
    const body = await validateBody(updateSellerProductSchema, request);

    if (isApiMockEnabled()) {
      return success(mockSellerCreatedProduct);
    }

    const { store } = await requireSellerStore();
    const data = await updateSellerProduct(
      store.id,
      parsedProductId.productId,
      body
    );
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  const { productId } = await params;
  const parsedProductId = validateProductId(productId);
  if (!parsedProductId.ok) return parsedProductId.response;

  if (isApiMockEnabled()) {
    return success(null);
  }

  try {
    const { store } = await requireSellerStore();
    const data = await deleteSellerProduct(store.id, parsedProductId.productId);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
