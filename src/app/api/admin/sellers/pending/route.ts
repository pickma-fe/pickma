import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { filterMockAdminPendingSellerApplications } from '@/mocks/admin';

import { pendingSellerApplicationsQuerySchema } from '../_lib/schemas';
import { getPendingSellerApplications } from '../_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const isMock = isApiMockEnabled();

    if (!isMock) {
      await requireAdmin();
    }

    const query = validateQuery(
      pendingSellerApplicationsQuerySchema,
      request.nextUrl.searchParams
    );

    if (isMock) {
      return success(filterMockAdminPendingSellerApplications(query));
    }

    const data = await getPendingSellerApplications(query);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
