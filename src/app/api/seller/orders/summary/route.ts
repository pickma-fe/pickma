import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockSellerOrders } from '@/mocks/seller';

import { getSellerOrderSummary } from '../_lib/service';
import { buildSellerOrderSummaryFromStatuses } from '../_lib/summary';

export async function GET(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      return success(
        buildSellerOrderSummaryFromStatuses(
          mockSellerOrders.map((order) => order.status)
        )
      );
    }

    const { store } = await requireSellerStore();
    const data = await getSellerOrderSummary(store.id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
