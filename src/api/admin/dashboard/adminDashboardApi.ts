import type { AdminDashboardStats } from '@/types/admin';
import type { AdminDashboardStatsResponse } from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';

import { mapAdminDashboardStats } from './adminDashboardMapper';

export const adminDashboardApi = {
  getStats(): Promise<AdminDashboardStats> {
    return apiClient
      .get<AdminDashboardStatsResponse>('/api/admin/dashboard/stats')
      .then(mapAdminDashboardStats);
  },
};
