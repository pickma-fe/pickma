'use client';

import { useState, useEffect, useRef } from 'react';

import type { BusinessInfoData } from '@/types/store';

import type { AuthStepState } from '../_components/types';

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
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoData | null>(
    null
  );
  const [documentFiles, setDocumentFiles] = useState<Record<
    string,
    File | null
  > | null>(null);
  const [termsAgreed, setTermsAgreed] = useState<Record<
    string,
    boolean
  > | null>(null);
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

  const handleTermsComplete = (agreed: Record<string, boolean>) => {
    setTermsAgreed(agreed);
    setAuthState((prev) => ({ ...prev, termsAgreed: true }));
  };

  const handleBusinessInfoComplete = (data: BusinessInfoData) => {
    if (!authState.termsAgreed) return;
    setBusinessInfo(data);
    setAuthState((prev) => ({ ...prev, businessInfoSubmitted: true }));
  };

  const handleDocumentComplete = (files: Record<string, File | null>) => {
    if (!authState.termsAgreed || !authState.businessInfoSubmitted) return;
    setDocumentFiles(files);
    setAuthState((prev) => ({
      ...prev,
      documentsSubmitted: true,
      reviewStatus: 'pending',
      certificationStatus: 'waiting',
      rejectionReason: undefined,
    }));

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
    businessInfo,
    documentFiles,
    termsAgreed,
    isAuthCompleted,
    handleTermsComplete,
    handleBusinessInfoComplete,
    handleDocumentComplete,
  };
}
