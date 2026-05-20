import type { NextRequest } from 'next/server';

import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { mockSellerOrderList } from '@/mocks/seller';

import { sellerOrderListQuerySchema } from './_lib/schemas';
import { getSellerOrders } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = validateQuery(
      sellerOrderListQuerySchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) return success(mockSellerOrderList);

    const { store } = await requireSellerStore();
    const data = await getSellerOrders(store.id, params);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
