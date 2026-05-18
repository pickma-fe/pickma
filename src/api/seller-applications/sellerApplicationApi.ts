import type { SellerApplication } from '@/types/seller-application';
import type {
  CreateSellerApplicationRequest,
  SellerApplicationResponse,
} from '@/contracts/seller-application';
import { apiClient } from '@/api/apiClient';

import { mapSellerApplication } from './sellerApplicationMapper';

export const sellerApplicationApi = {
  createSellerApplication(
    body: CreateSellerApplicationRequest
  ): Promise<SellerApplication> {
    return apiClient
      .post<SellerApplicationResponse>('/api/seller-applications', body)
      .then(mapSellerApplication);
  },
};
