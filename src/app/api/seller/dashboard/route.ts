import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockSellerDashboardStats } from '@/mocks/seller';

import { getSellerDashboardStats } from './_lib/service';

export async function GET(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      return success(mockSellerDashboardStats);
    }

    const { store } = await requireSellerStore();
    const data = await getSellerDashboardStats(store.id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
