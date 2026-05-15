import type {
  AdminPendingSellerApplicationListResponse,
  RejectSellerApplicationRequest,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';

export const adminSellerApplicationApi = {
  getPendingSellerApplications(
    page = 1,
    pageSize = 20
  ): Promise<AdminPendingSellerApplicationListResponse> {
    return apiClient.get<AdminPendingSellerApplicationListResponse>(
      `/api/admin/sellers/pending?page=${page}&pageSize=${pageSize}`
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
