import type { NextRequest } from 'next/server';

import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { mockSellerOrders } from '@/mocks/seller';

import { sellerOrderListQuerySchema } from './_lib/schemas';
import { getSellerOrders } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = validateQuery(
      sellerOrderListQuerySchema,
      request.nextUrl.searchParams
    );

    const { store } = await requireSellerStore();

    if (isApiMockEnabled()) {
      const filtered = params.status
        ? mockSellerOrders.filter((o) => o.status === params.status)
        : mockSellerOrders;

      const totalCount = filtered.length;
      const offset = (params.page - 1) * params.pageSize;
      const items = filtered.slice(offset, offset + params.pageSize);

      return success({
        items,
        page: params.page,
        pageSize: params.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / params.pageSize),
      });
    }

    const data = await getSellerOrders(store.id, params);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
