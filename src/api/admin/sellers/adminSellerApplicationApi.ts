import type {
  AdminPendingSellerApplicationListQuery,
  AdminPendingSellerApplicationListResponse,
  RejectSellerApplicationRequest,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';

export const adminSellerApplicationApi = {
  getPendingSellerApplications(
    params: AdminPendingSellerApplicationListQuery = {}
  ): Promise<AdminPendingSellerApplicationListResponse> {
    return apiClient.get<AdminPendingSellerApplicationListResponse>(
      '/api/admin/sellers/pending',
      params
    );
  },

  approveSellerApplication(id: string): Promise<void> {
    return apiClient.post<void>(`/api/admin/sellers/${id}/approve`);
  },

  rejectSellerApplication(
    id: string,
    body: RejectSellerApplicationRequest
  ): Promise<void> {
    return apiClient.post<void>(`/api/admin/sellers/${id}/reject`, body);
  },
};
