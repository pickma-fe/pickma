import type { SellerDashboardStatsResponse } from '@/contracts/seller';
import { apiClient } from '@/api/apiClient';

async function getStats(): Promise<SellerDashboardStatsResponse> {
  return apiClient.get<SellerDashboardStatsResponse>('/api/seller/dashboard');
}

export const sellerDashboardApi = {
  getStats,
};
