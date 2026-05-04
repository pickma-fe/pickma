'use client';

import { useState, useEffect, useRef } from 'react';

type ReviewStatus = 'pending' | 'reviewing' | 'completed';
type CertificationStatus = 'waiting' | 'approved' | 'rejected';

export interface AuthStepState {
  termsAgreed: boolean;
  businessInfoSubmitted: boolean;
  documentsSubmitted: boolean;
  reviewStatus: ReviewStatus;
  certificationStatus: CertificationStatus;
  rejectionReason?: string;
}

const INITIAL_AUTH_STATE: AuthStepState = {
  termsAgreed: false,
  businessInfoSubmitted: false,
  documentsSubmitted: false,
  reviewStatus: 'pending',
  certificationStatus: 'waiting',
  rejectionReason: undefined,
};

export function useSellerAuth() {
  const [authState, setAuthState] = useState<AuthStepState>(INITIAL_AUTH_STATE);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const handleTermsComplete = () => {
    setAuthState((prev) => ({ ...prev, termsAgreed: true }));
  };

  const handleBusinessInfoComplete = () => {
    if (!authState.termsAgreed) return;
    setAuthState((prev) => ({ ...prev, businessInfoSubmitted: true }));
  };

  const handleDocumentComplete = () => {
    if (!authState.termsAgreed || !authState.businessInfoSubmitted) return;
    setAuthState((prev) => ({
      ...prev,
      documentsSubmitted: true,
      reviewStatus: 'pending',
      certificationStatus: 'waiting',
      rejectionReason: undefined,
    }));

    // TODO: API 연동 시 아래 테스트 코드 삭제
    clearTimers();

    const timer1 = setTimeout(() => {
      setAuthState((prev) => ({ ...prev, reviewStatus: 'reviewing' }));
    }, 3000);

    const timer2 = setTimeout(() => {
      setAuthState((prev) => ({ ...prev, reviewStatus: 'completed' }));
    }, 6000);

    const timer3 = setTimeout(() => {
      setAuthState((prev) => ({ ...prev, certificationStatus: 'approved' }));
    }, 9000);

    timersRef.current = [timer1, timer2, timer3];
  };

  const isAuthCompleted = authState.certificationStatus === 'approved';

  return {
    authState,
    isAuthCompleted,
    handleTermsComplete,
    handleBusinessInfoComplete,
    handleDocumentComplete,
  };
}
