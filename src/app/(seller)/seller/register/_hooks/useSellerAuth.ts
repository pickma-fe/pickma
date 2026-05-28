'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { SellerOnboardingStatus } from '@/types/seller-application';
import type { BusinessInfoData } from '@/types/store';
import { sellerOnboardingApi } from '@/api/seller/onboarding/sellerOnboardingApi';
import { useCreateSellerApplication } from '@/hooks/seller/applications/useCreateSellerApplication';

import type { AuthStepState } from '../_components/types';

// TODO(T29): API 확장 후 신청 데이터(businessInfo, termsAgreed, documentFiles) 복원 필요
// 현재는 applicationStatus만 반환하므로 페이지 이동 후 로컬 state 초기화 불가

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
    staleTime: 10 * 1000,
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

  // 로컬 제출 상태 OR API 신청 존재 여부로 결정
  // TODO(T29): API 확장 후 실제 데이터 복원 필요
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
    onClose: () => void
  ) => {
    if (
      !resolvedTermsSubmitted ||
      !resolvedBusinessInfoSubmitted ||
      !businessInfo
    )
      return;

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
