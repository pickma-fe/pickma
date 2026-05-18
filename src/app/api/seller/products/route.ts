import type { NextRequest } from 'next/server';

import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockSellerCreatedProduct, mockSellerProducts } from '@/mocks/seller';

import { createSellerProductSchema } from './_lib/schemas';
import { createSellerProduct, getSellerProducts } from './_lib/service';

export async function GET(): Promise<Response> {
  if (isApiMockEnabled()) return success(mockSellerProducts);

  try {
    const { store } = await requireSellerStore();
    const data = await getSellerProducts(store.id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(createSellerProductSchema, request);

    if (isApiMockEnabled()) {
      return success(mockSellerCreatedProduct, 201);
    }

    const { store } = await requireSellerStore();
    const data = await createSellerProduct(store.id, body);
    return success(data, 201);
  } catch (error) {
    return routeError(error);
  }
}
