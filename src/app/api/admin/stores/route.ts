import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { filterMockAdminStores } from '@/mocks/admin';

import { adminStoresQuerySchema } from './_lib/schemas';
import { getAdminStores } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const query = validateQuery(
      adminStoresQuerySchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      return success(filterMockAdminStores(query));
    }

    const data = await getAdminStores(query);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
