import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockSellerOrders } from '@/mocks/seller';

import { getSellerOrderSummary } from '../_lib/service';

function getMockSellerOrderSummary() {
  return mockSellerOrders.reduce(
    (summary, order) => {
      summary.totalCount += 1;

      switch (order.status) {
        case 'reserved':
        case 'accepted':
        case 'ready':
        case 'completed':
        case 'cancelling':
        case 'cancelled':
        case 'expired':
          summary.statusCounts[order.status] += 1;
          break;
        case 'no_show':
          summary.statusCounts.noShow += 1;
          break;
      }

      return summary;
    },
    {
      totalCount: 0,
      statusCounts: {
        reserved: 0,
        accepted: 0,
        ready: 0,
        completed: 0,
        cancelling: 0,
        cancelled: 0,
        noShow: 0,
        expired: 0,
      },
    }
  );
}

export async function GET(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      return success(getMockSellerOrderSummary());
    }

    const { store } = await requireSellerStore();
    const data = await getSellerOrderSummary(store.id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
