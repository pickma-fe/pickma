import type { SellerOnboardingStatusResponse } from '@/contracts/seller-application';

import type { OnboardingStatusData } from './service';

export function toSellerOnboardingStatusResponse(
  data: OnboardingStatusData
): SellerOnboardingStatusResponse {
  return {
    role: data.role,
    applicationStatus: data.applicationStatus,
    hasStore: data.hasStore,
    ...(data.latestRejectReason !== undefined && {
      latestRejectReason: data.latestRejectReason,
    }),
  };
}
