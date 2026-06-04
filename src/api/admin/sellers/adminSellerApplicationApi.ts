import type { PaginatedResult } from '@/types/common';
import type {
  AdminPendingSellerApplication,
  AdminPendingSellerApplicationListParams,
} from '@/types/seller-application';
import type {
  AdminPendingSellerApplicationListResponse,
  RejectSellerApplicationRequest,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';

import { mapAdminPendingSellerApplicationList } from './adminSellerApplicationMapper';

export const adminSellerApplicationApi = {
  getPendingSellerApplications(
    params: AdminPendingSellerApplicationListParams = {}
  ): Promise<PaginatedResult<AdminPendingSellerApplication>> {
    return apiClient
      .get<AdminPendingSellerApplicationListResponse>(
        '/api/admin/sellers/pending',
        params
      )
      .then(mapAdminPendingSellerApplicationList);
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
