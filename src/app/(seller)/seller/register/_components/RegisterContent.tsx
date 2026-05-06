'use client';

import { useState } from 'react';

import type { BusinessInfoData, StoreInfoData } from '@/types/store';
import { useSellerAuth } from '@/hooks/seller/register/useSellerAuth';
import { useStoreRegister } from '@/hooks/seller/register/useStoreRegister';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

import { AuthStepList } from './AuthStepList';
import { BusinessInfoStep } from './BusinessInfoStep';
import { STORE_STEPS } from './constants';
import { DocumentStep } from './DocumentStep';
import { StepModal } from './StepModal';
import { StoreInfoStep } from './StoreInfoStep';
import { StoreStepList } from './StoreStepList';
import { TermsStep } from './TermsStep';
import type { ModalType } from './types';

export function RegisterContent() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const {
    authState,
    businessInfo,
    documentFiles,
    termsAgreed,
    isAuthCompleted,
    handleTermsComplete,
    handleBusinessInfoComplete,
    handleDocumentComplete,
  } = useSellerAuth();

  const { storeState, storeInfo, handleStoreInfoComplete } = useStoreRegister();

  const handleCloseModal = () => {
    setActiveModal(null);
    setIsViewMode(false);
  };

  const handleOpenModal = (modal: ModalType) => {
    if (modal === 'business' && !authState.termsAgreed) return;
    if (modal === 'document' && !authState.businessInfoSubmitted) return;
    if (
      modal === 'storeInfo' &&
      (!authState.documentsSubmitted || !isAuthCompleted)
    )
      return;

    const isView =
      (modal === 'terms' && authState.termsAgreed) ||
      (modal === 'business' && authState.businessInfoSubmitted) ||
      (modal === 'document' && authState.documentsSubmitted) ||
      (modal === 'storeInfo' && storeState.storeInfoSubmitted);
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

  const onDocumentComplete = (files: Record<string, File | null>) => {
    handleDocumentComplete(files);
    handleCloseModal();
  };

  const onStoreInfoComplete = (data: StoreInfoData) => {
    handleStoreInfoComplete(data);
    handleCloseModal();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          인증 및 가게 등록
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          판매자 인증과 가게 정보를 등록하고 픽마에서 고객을 만나보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section variant="card" className="flex flex-col gap-4 bg-white">
          <h2 className="text-base font-semibold text-gray-900">
            1. 판매자 인증
          </h2>
          <p className="text-xs text-gray-400">
            인증은 가게를 열기 전에 판매자 인증 진행해주세요.
          </p>
          <AuthStepList state={authState} onActionClick={handleOpenModal} />
          <div className="bg-primary-50 text-primary-700 rounded-md p-3 text-xs">
            정확한 정보 제출 시 빠른 심사가 진행됩니다! 보통 영업일 기준 1~2일
            내 심사가 완료됩니다.
          </div>
        </Section>

        <Section variant="card" className="flex flex-col gap-4 bg-white">
          <h2 className="text-base font-semibold text-gray-900">
            2. 가게 등록
          </h2>
          <p className="text-xs text-gray-400">
            판매자 인증이 완료되면 가게 정보를 등록할 수 있습니다.
          </p>
          <StoreStepList
            steps={STORE_STEPS}
            storeState={storeState}
            isAuthCompleted={isAuthCompleted}
            onActionClick={handleOpenModal}
          />
          <div className="bg-primary-50 text-primary-700 rounded-md p-3 text-xs">
            모든 정보 입력 및 심사 완료 시 가게가 오픈됩니다! 정확한 정보 입력이
            승인에 도움이 됩니다.
          </div>
        </Section>
      </div>

      <Section
        variant="card"
        className="flex flex-col items-start justify-between gap-4 bg-white sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-sm font-medium text-gray-900">
            도움이 필요하신가요?
          </p>
          <p className="text-xs text-gray-400">
            픽마 파트너센터 이용 가이드를 확인해보세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" color="gray">
            1:1 문의하기
          </Button>
          <Button>고객센터</Button>
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
        />
      </StepModal>

      <StepModal
        isOpen={activeModal === 'storeInfo'}
        onClose={handleCloseModal}
        title={isViewMode ? '가게 정보 확인' : '기본 정보 입력'}
      >
        <StoreInfoStep
          onSubmit={onStoreInfoComplete}
          savedData={storeInfo}
          isViewMode={isViewMode}
        />
      </StepModal>
    </div>
  );
}
