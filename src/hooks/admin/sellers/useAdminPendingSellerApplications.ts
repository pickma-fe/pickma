'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type {
  AdminPendingSellerApplication,
  AdminPendingSellerApplicationListParams,
} from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { adminSellerApplicationApi } from '@/api/admin/sellers/adminSellerApplicationApi';

export function useAdminPendingSellerApplications(
  params: AdminPendingSellerApplicationListParams = {}
) {
  return useQuery<PaginatedResult<AdminPendingSellerApplication>>({
    queryKey: queryKeys.admin.sellers.pendingList(params),
    queryFn: () =>
      adminSellerApplicationApi.getPendingSellerApplications(params),
  });
}
