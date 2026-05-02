'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';
import {
  mockSellerAuthState,
  mockStoreRegisterState,
  type MockStoreStepState,
} from '@/mocks/seller';

import { AuthStepList } from './AuthStepList';
import { BusinessInfoStep } from './BusinessInfoStep';
import { STORE_STEPS } from './constants';
import { DocumentStep } from './DocumentStep';
import { StepModal } from './StepModal';
import { StoreInfoStep } from './StoreInfoStep';
import { StoreStepList } from './StoreStepList';
import { TermsStep } from './TermsStep';
import type { AuthStepState, ModalType } from './types';

export function RegisterContent() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [authState, setAuthState] =
    useState<AuthStepState>(mockSellerAuthState);
  const [storeState, setStoreState] = useState<MockStoreStepState>(
    mockStoreRegisterState
  );

  const handleCloseModal = () => setActiveModal(null);

  const handleTermsComplete = () => {
    setAuthState((prev) => ({ ...prev, termsAgreed: true }));
    handleCloseModal();
  };

  const handleBusinessInfoComplete = () => {
    setAuthState((prev) => ({ ...prev, businessInfoSubmitted: true }));
    handleCloseModal();
  };

  const handleDocumentComplete = () => {
    setAuthState((prev) => ({
      ...prev,
      documentsSubmitted: true,
      reviewStatus: 'pending',
    }));
    handleCloseModal();

    // Test (API 연동 시 삭제)
    setTimeout(() => {
      setAuthState((prev) => ({ ...prev, reviewStatus: 'reviewing' }));
    }, 3000);

    setTimeout(() => {
      setAuthState((prev) => ({ ...prev, reviewStatus: 'completed' }));
    }, 6000);

    setTimeout(() => {
      setAuthState((prev) => ({ ...prev, certificationStatus: 'approved' }));
    }, 9000);
  };

  const handleStoreInfoComplete = () => {
    setStoreState((prev) => ({
      ...prev,
      storeInfoSubmitted: true,
      reviewStatus: 'pending',
    }));
    handleCloseModal();

    // Test (API 연동 시 삭제)
    setTimeout(() => {
      setStoreState((prev) => ({ ...prev, reviewStatus: 'reviewing' }));
    }, 3000);

    setTimeout(() => {
      setStoreState((prev) => ({ ...prev, reviewStatus: 'completed' }));
    }, 6000);

    setTimeout(() => {
      setStoreState((prev) => ({ ...prev, storeStatus: 'approved' }));
    }, 9000);
  };

  const isAuthCompleted = authState.certificationStatus === 'approved';

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

      {/* 그리드 반응형: 기본 1열, xl 이상 2열 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section variant="card" className="flex flex-col gap-4 bg-white">
          <h2 className="text-base font-semibold text-gray-900">
            1. 판매자 인증
          </h2>
          <p className="text-xs text-gray-400">
            인증은 가게를 열기 전에 판매자 인증 진행해주세요.
          </p>
          <AuthStepList state={authState} onActionClick={setActiveModal} />
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
            onActionClick={setActiveModal}
          />
          <div className="bg-primary-50 text-primary-700 rounded-md p-3 text-xs">
            모든 정보 입력 및 심사 완료 시 가게가 오픈됩니다! 정확한 정보 입력이
            승인에 도움이 됩니다.
          </div>
        </Section>
      </div>

      {/* 도움말 섹션 반응형 */}
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

      {/* 모달들 */}
      <StepModal
        isOpen={activeModal === 'terms'}
        onClose={handleCloseModal}
        title="약관 동의"
      >
        <TermsStep onNext={handleTermsComplete} />
      </StepModal>

      <StepModal
        isOpen={activeModal === 'business'}
        onClose={handleCloseModal}
        title="사업자 정보 입력"
      >
        <BusinessInfoStep onNext={handleBusinessInfoComplete} />
      </StepModal>

      <StepModal
        isOpen={activeModal === 'document'}
        onClose={handleCloseModal}
        title="서류 제출"
      >
        <DocumentStep onSubmit={handleDocumentComplete} />
      </StepModal>

      <StepModal
        isOpen={activeModal === 'storeInfo'}
        onClose={handleCloseModal}
        title="기본 정보 입력"
      >
        <StoreInfoStep onSubmit={handleStoreInfoComplete} />
      </StepModal>
    </div>
  );
}
