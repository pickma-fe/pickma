import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { filterMockAdminProducts } from '@/mocks/admin';

import { adminProductsQuerySchema } from './_lib/schemas';
import { getAdminProducts } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const query = validateQuery(
      adminProductsQuerySchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      return success(filterMockAdminProducts(query));
    }

    const data = await getAdminProducts(query);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
