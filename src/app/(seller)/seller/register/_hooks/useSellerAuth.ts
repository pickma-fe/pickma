'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { SellerOnboardingStatus } from '@/types/seller-application';
import type { BusinessInfoData } from '@/types/store';
import { sellerOnboardingApi } from '@/api/seller/onboarding/sellerOnboardingApi';
import { useCreateSellerApplication } from '@/hooks/seller/applications/useCreateSellerApplication';

import type { AuthStepState } from '../_components/types';

export function useSellerAuth() {
  const [termsAgreed, setTermsAgreed] = useState<Record<
    string,
    boolean
  > | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoData | null>(
    null
  );
  const [documentFiles, setDocumentFiles] = useState<Record<
    string,
    File | null
  > | null>(null);

  const [termsSubmitted, setTermsSubmitted] = useState(false);
  const [businessInfoSubmitted, setBusinessInfoSubmitted] = useState(false);
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

  const {
    mutate: createSellerApplication,
    isPending: isApplicationPending,
    error: applicationError,
  } = useCreateSellerApplication();

  const { data: onboardingStatus } = useQuery<SellerOnboardingStatus>({
    queryKey: ['sellers', 'onboarding-status'],
    queryFn: () => sellerOnboardingApi.getSellerOnboardingStatus(),
    staleTime: 30 * 1000,
    enabled: documentsSubmitted,
    refetchInterval: documentsSubmitted ? 5000 : false,
  });

  const applicationStatus = onboardingStatus?.applicationStatus;

  let reviewStatus: AuthStepState['reviewStatus'] = 'pending';
  let certificationStatus: AuthStepState['certificationStatus'] = 'waiting';
  let rejectionReason: string | undefined;

  if (documentsSubmitted) {
    reviewStatus = 'reviewing';
    if (applicationStatus === 'approved') {
      reviewStatus = 'completed';
      certificationStatus = 'approved';
    } else if (applicationStatus === 'rejected') {
      reviewStatus = 'completed';
      certificationStatus = 'rejected';
      rejectionReason = onboardingStatus?.latestRejectReason;
    }
  }

  const authState: AuthStepState = {
    termsAgreed: termsSubmitted,
    businessInfoSubmitted,
    documentsSubmitted,
    reviewStatus,
    certificationStatus,
    rejectionReason,
  };

  const isAuthCompleted = certificationStatus === 'approved';

  const handleTermsComplete = (agreed: Record<string, boolean>) => {
    setTermsAgreed(agreed);
    setTermsSubmitted(true);
  };

  const handleBusinessInfoComplete = (data: BusinessInfoData) => {
    if (!termsSubmitted) return;
    setBusinessInfo(data);
    setBusinessInfoSubmitted(true);
  };

  const handleDocumentComplete = (
    files: Record<string, File | null>,
    onClose: () => void
  ) => {
    if (!termsSubmitted || !businessInfoSubmitted || !businessInfo) return;

    const { businessLicense, idCard, bankbook, businessReport } = files;
    if (!businessLicense || !idCard || !bankbook || !businessReport) return;

    createSellerApplication(
      {
        ...businessInfo,
        documents: { businessLicense, idCard, bankbook, businessReport },
      },
      {
        onSuccess: () => {
          setDocumentFiles(files);
          setDocumentsSubmitted(true);
          onClose();
        },
        onError: () => {
          setDocumentFiles(null);
        },
      }
    );
  };

  return {
    authState,
    businessInfo,
    documentFiles,
    termsAgreed,
    isAuthCompleted,
    isApplicationPending,
    applicationError,
    handleTermsComplete,
    handleBusinessInfoComplete,
    handleDocumentComplete,
  };
}
