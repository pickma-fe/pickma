'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { AdminOrderListItem } from '@/types/admin';
import type { PaginatedResult } from '@/types/common';
import { queryKeys } from '@/lib/queryKeys';
import { adminOrderApi } from '@/api/admin/orders/adminOrderApi';

export type AdminOrdersQuery = NonNullable<
  Parameters<typeof adminOrderApi.getOrders>[0]
>;

export function useAdminOrders(
  params: AdminOrdersQuery = {}
): UseQueryResult<PaginatedResult<AdminOrderListItem>> {
  return useQuery<PaginatedResult<AdminOrderListItem>>({
    queryKey: queryKeys.admin.orders.list(params),
    queryFn: () => adminOrderApi.getOrders(params),
  });
}
