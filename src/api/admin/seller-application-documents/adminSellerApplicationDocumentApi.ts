import type { SellerApplicationDocumentReadUrlResponse } from '@/contracts/seller-application';
import { apiClient } from '@/api/apiClient';

export const adminSellerApplicationDocumentApi = {
  getSellerApplicationDocumentReadUrl(
    id: string
  ): Promise<SellerApplicationDocumentReadUrlResponse> {
    return apiClient.post<SellerApplicationDocumentReadUrlResponse>(
      `/api/admin/seller-application-documents/${id}/read-url`
    );
  },
};
