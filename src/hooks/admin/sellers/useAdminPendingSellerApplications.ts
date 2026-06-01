'use client';

import { useQuery } from '@tanstack/react-query';

import type { AdminPendingSellerApplicationListResponse } from '@/contracts/admin';
import { queryKeys } from '@/lib/queryKeys';
import { adminSellerApplicationApi } from '@/api/admin/sellers/adminSellerApplicationApi';

export function useAdminPendingSellerApplications(page = 1, pageSize = 20) {
  return useQuery<AdminPendingSellerApplicationListResponse>({
    queryKey: queryKeys.admin.sellers.pendingList({ page, pageSize }),
    queryFn: () =>
      adminSellerApplicationApi.getPendingSellerApplications(page, pageSize),
  });
}
