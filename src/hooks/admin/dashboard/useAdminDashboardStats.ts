'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { AdminDashboardStats } from '@/types/admin';
import { queryKeys } from '@/lib/queryKeys';
import { adminDashboardApi } from '@/api/admin/dashboard/adminDashboardApi';

export function useAdminDashboardStats(): UseQueryResult<AdminDashboardStats> {
  return useQuery<AdminDashboardStats>({
    queryKey: queryKeys.admin.dashboard.stats(),
    queryFn: () => adminDashboardApi.getStats(),
  });
}
