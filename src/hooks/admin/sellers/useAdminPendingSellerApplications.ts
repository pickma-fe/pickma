'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { AdminPendingSellerApplication } from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { adminSellerApplicationApi } from '@/api/admin/sellers/adminSellerApplicationApi';

export type AdminPendingSellerApplicationsQuery = NonNullable<
  Parameters<typeof adminSellerApplicationApi.getPendingSellerApplications>[0]
>;

export function useAdminPendingSellerApplications(
  params: AdminPendingSellerApplicationsQuery = {}
) {
  return useQuery<PaginatedResult<AdminPendingSellerApplication>>({
    queryKey: queryKeys.admin.sellers.pendingList(params),
    queryFn: () =>
      adminSellerApplicationApi.getPendingSellerApplications(params),
  });
}
