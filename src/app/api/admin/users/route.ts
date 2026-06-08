import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { filterMockAdminUsers } from '@/mocks/admin';

import { adminUsersQuerySchema } from './_lib/schemas';
import { getAdminUsers } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();

    const query = validateQuery(
      adminUsersQuerySchema,
      request.nextUrl.searchParams
    );

    if (isApiMockEnabled()) {
      return success(filterMockAdminUsers(query));
    }

    const data = await getAdminUsers(query);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
