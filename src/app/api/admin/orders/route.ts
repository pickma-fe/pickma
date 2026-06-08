import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { filterMockAdminOrders } from '@/mocks/admin';

import { adminOrdersQuerySchema } from './_lib/schemas';
import { getAdminOrders } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const query = validateQuery(
      adminOrdersQuerySchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      return success(filterMockAdminOrders(query));
    }

    const data = await getAdminOrders(query);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
