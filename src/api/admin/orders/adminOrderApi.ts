import type { AdminOrderListItem } from '@/types/admin';
import type { PaginatedResult } from '@/types/common';
import type {
  AdminOrderListQuery,
  AdminOrderListResponse,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';
import { mapOrderListItem } from '@/api/orders/orderMapper';

export const adminOrderApi = {
  getOrders(
    params: AdminOrderListQuery = {}
  ): Promise<PaginatedResult<AdminOrderListItem>> {
    return apiClient
      .get<AdminOrderListResponse>('/api/admin/orders', params)
      .then((res) => ({ ...res, items: res.items.map(mapOrderListItem) }));
  },
};
