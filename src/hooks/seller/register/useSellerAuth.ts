'use client';

import { useState } from 'react';

import type { AuthStepState } from '@/types/seller-register';
import type { BusinessInfoData } from '@/types/store';
import { useCreateSellerApplication } from '@/hooks/seller/applications/useCreateSellerApplication';
import { useSellerOnboardingStatus } from '@/hooks/seller/onboarding/useSellerOnboardingStatus';

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

  const { data: onboardingStatus } = useSellerOnboardingStatus({
    refetchInterval: (query) => {
      const status = query.state.data?.applicationStatus;
      if (status === 'pending') return 10 * 1000;
      return false;
    },
  });

  const applicationStatus = onboardingStatus?.applicationStatus;

  const isApiPending = applicationStatus === 'pending';
  const isApiApproved = applicationStatus === 'approved';
  const isApiRejected = applicationStatus === 'rejected';
  const hasApplication = isApiPending || isApiApproved || isApiRejected;

  const resolvedDocumentsSubmitted = documentsSubmitted || hasApplication;
  const resolvedBusinessInfoSubmitted = businessInfoSubmitted || hasApplication;
  const resolvedTermsSubmitted = termsSubmitted || hasApplication;

  let reviewStatus: AuthStepState['reviewStatus'] = 'pending';
  let certificationStatus: AuthStepState['certificationStatus'] = 'waiting';
  let rejectionReason: string | undefined;

  if (resolvedDocumentsSubmitted) {
    reviewStatus = 'reviewing';
    if (isApiApproved) {
      reviewStatus = 'completed';
      certificationStatus = 'approved';
    } else if (isApiRejected) {
      reviewStatus = 'completed';
      certificationStatus = 'rejected';
      rejectionReason = onboardingStatus?.latestRejectReason;
    }
  }

  const authState: AuthStepState = {
    termsAgreed: resolvedTermsSubmitted,
    businessInfoSubmitted: resolvedBusinessInfoSubmitted,
    documentsSubmitted: resolvedDocumentsSubmitted,
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
    if (!resolvedTermsSubmitted) return;
    setBusinessInfo(data);
    setBusinessInfoSubmitted(true);
  };

  const handleDocumentComplete = (
    files: Record<string, File | null>,
    documentConsentAgreed: true,
    onClose: () => void
  ) => {
    if (
      !resolvedTermsSubmitted ||
      !resolvedBusinessInfoSubmitted ||
      !businessInfo
    )
      return;

    const { businessLicense, foodServicePermit, bankAccount } = files;
    if (!businessLicense || !foodServicePermit || !bankAccount) return;

    createSellerApplication(
      {
        ...businessInfo,
        documentConsentAgreed,
        documents: { businessLicense, foodServicePermit, bankAccount },
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
