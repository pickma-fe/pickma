import type { NextRequest } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { buildMockProductListResponse } from '@/mocks/productList';

import { productListSchema } from './_lib/schemas';
import { getProducts } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = validateQuery(
      productListSchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      return success(buildMockProductListResponse(params));
    }

    const supabase = await createServerClient();
    const viewerUserId =
      params.sort === 'aiRecommendation'
        ? (await supabase.auth.getUser()).data.user?.id
        : undefined;
    const data = await getProducts(supabase, params, viewerUserId);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
