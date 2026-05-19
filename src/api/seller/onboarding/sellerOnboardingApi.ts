import type { SellerOnboardingStatus } from '@/types/seller-application';
import type { SellerOnboardingStatusResponse } from '@/contracts/seller-application';
import { apiClient } from '@/api/apiClient';

function mapSellerOnboardingStatus(
  dto: SellerOnboardingStatusResponse
): SellerOnboardingStatus {
  return {
    role: dto.role,
    applicationStatus: dto.applicationStatus,
    hasStore: dto.hasStore,
    ...(dto.latestRejectReason !== undefined && {
      latestRejectReason: dto.latestRejectReason,
    }),
  };
}

export const sellerOnboardingApi = {
  getSellerOnboardingStatus(): Promise<SellerOnboardingStatus> {
    return apiClient
      .get<SellerOnboardingStatusResponse>('/api/seller/onboarding-status')
      .then(mapSellerOnboardingStatus);
  },
};
