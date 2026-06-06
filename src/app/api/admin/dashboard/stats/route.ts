import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockAdminDashboardStats } from '@/mocks/admin';

import { getAdminDashboardStats } from '../_lib/service';

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();

    if (isApiMockEnabled()) {
      return success(mockAdminDashboardStats);
    }

    const data = await getAdminDashboardStats();
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
