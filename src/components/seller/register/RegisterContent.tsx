'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ModalType } from '@/types/seller-register';
import type { BusinessInfoData } from '@/types/store';
import { useSellerAuth } from '@/hooks/seller/register/useSellerAuth';
import { Section } from '@/components/common/Section/Section';

import { AuthStepList } from './AuthStepList';
import { BusinessInfoStep } from './BusinessInfoStep';
import { DocumentStep } from './DocumentStep';
import { StepModal } from './StepModal';
import { TermsStep } from './TermsStep';

export function RegisterContent() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const {
    authState,
    businessInfo,
    documentFiles,
    termsAgreed,
    isAuthCompleted,
    hasStore,
    isApplicationPending,
    applicationError,
    handleTermsComplete,
    handleBusinessInfoComplete,
    handleDocumentComplete,
  } = useSellerAuth();

  useEffect(() => {
    if (hasStore) {
      router.replace('/seller/dashboard');
    }
  }, [hasStore, router]);

  const handleCloseModal = () => {
    setActiveModal(null);
    setIsViewMode(false);
  };

  const handleOpenModal = (modal: ModalType) => {
    if (modal === 'business' && !authState.termsAgreed) return;
    if (modal === 'document' && !authState.businessInfoSubmitted) return;

    const isView =
      (modal === 'terms' && authState.termsAgreed) ||
      (modal === 'business' && authState.businessInfoSubmitted) ||
      (modal === 'document' && authState.documentsSubmitted);
    setIsViewMode(isView);
    setActiveModal(modal);
  };

  const onTermsComplete = (agreed: Record<string, boolean>) => {
    handleTermsComplete(agreed);
    handleCloseModal();
  };

  const onBusinessInfoComplete = (data: BusinessInfoData) => {
    handleBusinessInfoComplete(data);
    handleCloseModal();
  };

  const onDocumentComplete = (
    files: Record<string, File | null>,
    documentConsentAgreed: true
  ) => {
    handleDocumentComplete(files, documentConsentAgreed, handleCloseModal);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          판매자 인증
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          판매자 인증을 완료하고 가게를 등록해보세요.
        </p>
      </div>

      <Section variant="card" className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">판매자 인증</h2>
        <p className="text-xs text-gray-400">
          가게를 열기 전에 판매자 인증을 진행해주세요.
        </p>
        <AuthStepList state={authState} onActionClick={handleOpenModal} />
        <div className="bg-primary-50 text-primary-700 rounded-md p-3 text-xs">
          정확한 정보 제출 시 빠른 심사가 진행됩니다! 보통 영업일 기준 1~2일 내
          심사가 완료됩니다.
        </div>
      </Section>

      {isAuthCompleted && (
        <Section variant="card" className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">가게 등록</h2>
          <p className="text-sm text-gray-500">
            판매자 인증이 완료되었습니다. 가게 정보를 등록하고 픽마에서 판매를
            시작해보세요.
          </p>
          <div>
            <Link
              href="/seller/store/edit"
              className="bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-2 font-medium text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              가게 등록하기
            </Link>
          </div>
        </Section>
      )}

      <Section
        variant="card"
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-sm font-medium text-gray-900">
            도움이 필요하신가요?
          </p>
          <p className="text-xs text-gray-400">
            픽마 파트너센터 이용 가이드를 확인해보세요.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href="/support/inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-sm border border-gray-300 px-4 py-2 font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
          >
            1:1 문의하기
          </Link>
          <Link
            href="/support"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex w-full items-center justify-center rounded-sm border border-transparent px-4 py-2 font-medium text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
          >
            고객센터
          </Link>
        </div>
      </Section>

      <StepModal
        isOpen={activeModal === 'terms'}
        onClose={handleCloseModal}
        title={isViewMode ? '약관 동의 확인' : '약관 동의'}
      >
        <TermsStep
          onNext={onTermsComplete}
          savedAgreed={termsAgreed}
          isViewMode={isViewMode}
        />
      </StepModal>

      <StepModal
        isOpen={activeModal === 'business'}
        onClose={handleCloseModal}
        title={isViewMode ? '사업자 정보 확인' : '사업자 정보 입력'}
      >
        <BusinessInfoStep
          onNext={onBusinessInfoComplete}
          savedData={businessInfo}
          isViewMode={isViewMode}
        />
      </StepModal>

      <StepModal
        isOpen={activeModal === 'document'}
        onClose={handleCloseModal}
        title={isViewMode ? '서류 제출 확인' : '서류 제출'}
      >
        <DocumentStep
          onSubmit={onDocumentComplete}
          savedFiles={documentFiles}
          isViewMode={isViewMode}
          isPending={isApplicationPending}
          errorMessage={applicationError?.message}
        />
      </StepModal>
    </div>
  );
}
