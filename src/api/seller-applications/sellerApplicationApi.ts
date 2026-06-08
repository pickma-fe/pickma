import type { SellerApplication } from '@/types/seller-application';
import type {
  CreateSellerApplicationRequest,
  SellerApplicationDocumentReadUrlResponse,
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

  getMyApplication(): Promise<SellerApplication> {
    return apiClient
      .get<SellerApplicationResponse>('/api/seller-applications/me')
      .then(mapSellerApplication);
  },

  getDocumentSignedUrl(
    documentId: string
  ): Promise<SellerApplicationDocumentReadUrlResponse> {
    return apiClient.get<SellerApplicationDocumentReadUrlResponse>(
      `/api/seller-applications/me/documents/${documentId}`
    );
  },
};
