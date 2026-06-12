import type {
  OrderStatusParam,
  SellerOrderSummaryResponse,
} from '@/contracts/order';

export const SELLER_ORDER_SUMMARY_STATUSES = [
  'reserved',
  'accepted',
  'ready',
  'completed',
  'cancelling',
  'cancelled',
  'no_show',
  'expired',
] as const;

export type SellerOrderSummaryStatus =
  (typeof SELLER_ORDER_SUMMARY_STATUSES)[number];

export const SELLER_ORDER_SUMMARY_STATUS_KEY_MAP = {
  reserved: 'reserved',
  accepted: 'accepted',
  ready: 'ready',
  completed: 'completed',
  cancelling: 'cancelling',
  cancelled: 'cancelled',
  no_show: 'noShow',
  expired: 'expired',
} satisfies Record<
  SellerOrderSummaryStatus,
  keyof SellerOrderSummaryResponse['statusCounts']
>;

export function createEmptySellerOrderSummary(): SellerOrderSummaryResponse {
  return {
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
  };
}

export function buildSellerOrderSummaryFromStatuses(
  statuses: OrderStatusParam[]
): SellerOrderSummaryResponse {
  return statuses.reduce<SellerOrderSummaryResponse>((summary, status) => {
    if (status in SELLER_ORDER_SUMMARY_STATUS_KEY_MAP) {
      const key =
        SELLER_ORDER_SUMMARY_STATUS_KEY_MAP[status as SellerOrderSummaryStatus];
      summary.statusCounts[key] += 1;
    }

    summary.totalCount += 1;
    return summary;
  }, createEmptySellerOrderSummary());
}
