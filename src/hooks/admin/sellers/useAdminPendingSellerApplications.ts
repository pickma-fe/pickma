'use client';

import { useQuery } from '@tanstack/react-query';

import type {
  AdminPendingSellerApplicationListQuery,
  AdminPendingSellerApplicationListResponse,
} from '@/contracts/admin';
import { queryKeys } from '@/lib/queryKeys';
import { adminSellerApplicationApi } from '@/api/admin/sellers/adminSellerApplicationApi';

export function useAdminPendingSellerApplications(
  params: AdminPendingSellerApplicationListQuery = {}
) {
  return useQuery<AdminPendingSellerApplicationListResponse>({
    queryKey: queryKeys.admin.sellers.pendingList(params),
    queryFn: () =>
      adminSellerApplicationApi.getPendingSellerApplications(params),
  });
}
