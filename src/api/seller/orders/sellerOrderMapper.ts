import type { SellerOrderSummary } from '@/types/seller-order';
import type { SellerOrderSummaryResponse } from '@/contracts/order';
import { mapOrder, mapOrderListItem } from '@/api/orders/orderMapper';

export {
  mapOrder as mapSellerOrder,
  mapOrderListItem as mapSellerOrderListItem,
};

export function mapSellerOrderSummary(
  dto: SellerOrderSummaryResponse
): SellerOrderSummary {
  return {
    totalCount: dto.totalCount,
    statusCounts: {
      reserved: dto.statusCounts.reserved,
      accepted: dto.statusCounts.accepted,
      ready: dto.statusCounts.ready,
      completed: dto.statusCounts.completed,
      cancelling: dto.statusCounts.cancelling,
      cancelled: dto.statusCounts.cancelled,
      noShow: dto.statusCounts.noShow,
      expired: dto.statusCounts.expired,
    },
  };
}
