import type { NextRequest } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { mockProductDetailsMap, mockProductList } from '@/mocks/products';

import { productListSchema } from './_lib/schemas';
import { getProducts } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = validateQuery(
      productListSchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      const filteredItems = params.region
        ? mockProductList.items.filter(
            (product) =>
              mockProductDetailsMap[product.id]?.store.region === params.region
          )
        : mockProductList.items;
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize;

      return success({
        ...mockProductList,
        items: filteredItems.slice(from, to),
        page: params.page,
        pageSize: params.pageSize,
        totalCount: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / params.pageSize),
      });
    }

    const supabase = await createServerClient();
    const data = await getProducts(supabase, params);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
