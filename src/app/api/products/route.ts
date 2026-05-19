import type { NextRequest } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { mockProductDetailsMap, mockProductList } from '@/mocks/products';

import { productListSchema } from './_lib/schemas';
import { buildProductListResponse, getProducts } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = validateQuery(
      productListSchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      return success(
        buildProductListResponse(
          mockProductList.items,
          params,
          (product) => mockProductDetailsMap[product.id]?.store.region
        )
      );
    }

    const supabase = await createServerClient();
    const data = await getProducts(supabase, params);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
