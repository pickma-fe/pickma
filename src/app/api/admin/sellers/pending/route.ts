import type { NextRequest } from 'next/server';

import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateQuery } from '@/app/api/_lib/validation';
import { mockAdminPendingSellerApplicationList } from '@/mocks/admin';

import { pendingSellerApplicationsQuerySchema } from '../_lib/schemas';
import { getPendingSellerApplications } from '../_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) return success(mockAdminPendingSellerApplicationList);

  try {
    await requireAdmin();
    const { page, pageSize } = validateQuery(
      pendingSellerApplicationsQuerySchema,
      request.nextUrl.searchParams
    );
    const data = await getPendingSellerApplications(page, pageSize);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
