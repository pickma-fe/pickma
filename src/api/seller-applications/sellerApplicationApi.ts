import type {
  CreateSellerApplicationPayload,
  SellerApplication,
} from '@/types/seller-application';
import type {
  CreateSellerApplicationRequest,
  SellerApplicationDocumentReadUrlResponse,
  SellerApplicationResponse,
} from '@/contracts/seller-application';
import { apiClient } from '@/api/apiClient';

import { mapSellerApplication } from './sellerApplicationMapper';

function toCreateSellerApplicationRequest(
  input: CreateSellerApplicationPayload
): CreateSellerApplicationRequest {
  return { ...input };
}

export const sellerApplicationApi = {
  createSellerApplication(
    input: CreateSellerApplicationPayload
  ): Promise<SellerApplication> {
    return apiClient
      .post<SellerApplicationResponse>(
        '/api/seller-applications',
        toCreateSellerApplicationRequest(input)
      )
      .then(mapSellerApplication);
  },

  getMyApplication(): Promise<SellerApplication> {
    return apiClient
      .get<SellerApplicationResponse>('/api/seller-applications/me')
      .then(mapSellerApplication);
  },

  getDocumentSignedUrl(documentId: string): Promise<string> {
    return apiClient
      .get<SellerApplicationDocumentReadUrlResponse>(
        `/api/seller-applications/me/documents/${encodeURIComponent(documentId)}`
      )
      .then(({ signedUrl }) => signedUrl);
  },
};
